// import { authenticate } from "../shopify.server";
import { cors } from "remix-utils/cors";
import prisma from "../db.server";
import axios from "axios";

// some global variables
  const namespace = "wishlist-app";
  const key = "products";

const getAccessToken = async (shop) => {
    if (!shop) {
        throw new Error("Shop name is incorrect ");
    }

    console.log("Fetching settings for shop:", shop);
    const session = await prisma.session.findUnique({
        where: { shop: shop },
        select: { accessToken: true }
    });

    if (!session) {
        console.error("No session found for shop:", shop);
        return null;
    }

    console.log('shop', shop)

    // console.log('session data access token ', session.accessToken);
    return session.accessToken; // Adjust according to how you store the access token in your session
};



// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
// };

export async function loader({ request }) {
  console.log("fn called ");
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
      },
    });
  }

  // Your logic
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const shopDomain = shop.replace(/^https?:\/\//, '');
  const customerId = url.searchParams.get("customer_Id");

  const accessToken = await getAccessToken(shopDomain);
  const wishlist_product_ids = await getMetafieldValue(shopDomain, accessToken, customerId, namespace, key);

  return cors(
    request,
    new Response(JSON.stringify(wishlist_product_ids), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
}

async function checkMetafieldDefinition(shop, access_token) {
    console.log('checkMetafield fn called');
    const query = `
      query {
        metafieldDefinitions(first: 1, ownerType: CUSTOMER, namespace: "wishlist-app", key: "products") {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const shopUrl = `https://${shop}/admin/api/2025-01/graphql.json`;

    try {
        const response = await axios.post(
            shopUrl,
            { query },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": access_token,
                },
            }
        );

        const edges = response.data?.data?.metafieldDefinitions?.edges;
        if (edges && edges.length > 0) {
            return edges[0].node.id;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error checking metafield definition:", error);
        return null;
    }
}

async function createMetafieldDefinition(shop, access_token) {
    const mutation = `
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
        definition: {
            name: "Wishlist Products",
            namespace: namespace,
            key: key,
            description: "Customer wishlist products.",
            type: "json",
            ownerType: "CUSTOMER",
        },
    };

    const shopUrl = `https://${shop}/admin/api/2025-01/graphql.json`;

    try {
        const response = await axios.post(
            shopUrl,
            {
                query: mutation,
                variables: variables,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": access_token,
                },
            }
        );

        if (response.data?.errors) {
            console.error("Error creating metafield definition:", response.data.errors);
            throw new Error(response.data.errors[0].message);
        }

        const definitionId = response.data?.data?.metafieldDefinitionCreate?.createdDefinition?.id;
        return definitionId;

    } catch (error) {
        console.error('Error creating metafield definition:', error);
        throw error;
    }
}

async function updateCustomerMetafield(shop, accessToken, customerGID, productGID, definitionId, existingValue) {
    console.log(`update Customer Metafield fn called -> shop ${shop} access token ${accessToken} customerGID ${customerGID} productGID ${productGID} definitionId ${definitionId}`);
    if (!shop || !accessToken || !customerGID || !productGID || !definitionId) {
      throw new Error("Missing required parameters");
    }
  
    // const [namespace, key] = definitionId.split(':');
    // if (!namespace || !key) throw new Error("Invalid definitionId format - use 'namespace:key'");
  
    try {
      // 1. Get existing metafield
    //   const existing = await getMetafieldValue(shop, accessToken, customerGID, namespace, key);
         const existing = existingValue;
      let products = existing ? JSON.parse(existing) : [];

      console.log('existing: ', products);
      
      // 2. Update value
      if (!products.includes(productGID)) {
        products.push(productGID);
      }
      console.log('updated: ', products);
  
      // 3. Set updated value using metafieldsSet
      const mutation = `
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              key
              namespace
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
  
      const variables = {
        metafields: [{ 
          ownerId: customerGID,
          namespace,
          key,
          type: "json",
          value: JSON.stringify(products)
        }]
      };
  
      // 4. Execute mutation
      const response = await axios.post(
        `https://${shop}/admin/api/2025-01/graphql.json`,
        { query: mutation, variables },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          }
        }
      );
  
      // 5. Handle response
      const { data, errors } = response.data;
      if (errors) throw new Error(errors[0].message);
      if (data.metafieldsSet.userErrors?.length) {
        throw new Error(data.metafieldsSet.userErrors[0].message);
      }
  
      return data.metafieldsSet.metafields[0];
  
    } catch (error) {
      console.error("Metafield update failed:", error);
      throw new Error(`Failed to update wishlist: ${error.message}`); 
    }
  }

// remove metafield id fn : 
async function removeCustomerMetafield(shop, accessToken, customerGID, productGID, existingValue) {
   console.log('remove customer metafield fn called and : ', 'shop ', shop, accessToken, customerGID, productGID, existingValue)
  console.log(`remove Customer Metafield fn called -> shop ${shop} access token ${accessToken} customerGID ${customerGID} productGID ${productGID}`);
  if (!shop || !accessToken || !customerGID || !productGID) {
      throw new Error("Missing required parameters");
  }

  try {
      const existing = existingValue;
      let products = existing ? JSON.parse(existing) : [];

      console.log('existing: ', products);

      // Remove the productGID from the array if it exists
      products = products.filter(id => id !== productGID);

      console.log('updated: ', products);

      // Set updated value using metafieldsSet
      const mutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

      const variables = {
          metafields: [{
              ownerId: customerGID,
              namespace,
              key,
              type: "json",
              value: JSON.stringify(products)
          }]
      };

      // Execute mutation
      const response = await axios.post(
          `https://${shop}/admin/api/2025-01/graphql.json`,
          { query: mutation, variables },
          {
              headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": accessToken,
              }
          }
      );

      // Handle response
      const { data, errors } = response.data;
      if (errors) throw new Error(errors[0].message);
      if (data.metafieldsSet.userErrors?.length) {
          throw new Error(data.metafieldsSet.userErrors[0].message);
      }

      return data.metafieldsSet.metafields[0];

  } catch (error) {
      console.error("Metafield update failed:", error);
      throw new Error(`Failed to update wishlist: ${error.message}`);
  }
}


async function getMetafieldValue(shop, access_token, customer_id, namespace, key) {
    console.log(`get metafield fn Shop: ${shop}, Access Token: ${access_token}, Customer ID: ${customer_id}, Namespace: ${namespace}, Key: ${key}`);
  
    const query = `
      query GetCustomerMetafield($customerId: ID!, $namespace: String!, $key: String!) {
        customer(id: $customerId) {
          metafield(namespace: $namespace, key: $key) {
            id
            namespace
            key
            value
            type
          }
        }
      }
    `;
  
    const shopUrl = `https://${shop}/admin/api/2025-01/graphql.json`;
  
    console.log('Shop URL:', shopUrl);
  
    try {
      const response = await axios.post(
        shopUrl,
        {
          query,
          variables: {
            customerId: `gid://shopify/Customer/${customer_id}`,
            namespace,
            key,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": access_token,
          },
        }
      );
  
      const metafield = response.data?.data?.customer?.metafield; // Note the addition of 'data'
      console.log("Metafield data:", metafield);
  
      if (metafield) {
        return metafield.value;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching metafield value:", error);
      return null;
    }
  }

export async function action({ request }) {
    try {
        const body = await request.json();
        console.log('Body data', body);
        const { customer_id, product_id, shop, data_type } = body;
        const customerGID = `gid://shopify/Customer/${customer_id}`;
        const productGID = `gid://shopify/Product/${product_id}`;
        console.log('data_type', data_type, 'shop data ', shop);

        // Fetch the access token for the shop
        const access_token = await getAccessToken(shop);

        console.log(`customer_id: ${customer_id}, product_id: ${product_id}, shop: ${shop}, access_token: ${access_token}`);

       if (!access_token) {
            return new Response(JSON.stringify({ error: "No access token found for this shop." }), {
                status: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
            });
        }
         
       
        // Check if metafield definition exists
        let definitionId = await checkMetafieldDefinition(shop, access_token);
        console.log(`Metafield definition ID: ${definitionId}`);

        // If metafield definition doesn't exist, create it
        if (!definitionId) {
            console.log('if scope when metafield id not found');
            definitionId = await createMetafieldDefinition(shop, access_token);
        }

        if (!definitionId) {
            return new Response(JSON.stringify({ error: "Failed to create or find metafield definition." }), {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
            });
        }  

        if (definitionId) {
            console.log('fn called with definitionId: ' + definitionId);
            try {
                console.log('try start');
                const existingValue = await getMetafieldValue(shop, access_token, customer_id, namespace, key);
                console.log("existing value " + existingValue);

                if(data_type == "product_page") {
                  console.log('if scope');
                const data = await updateCustomerMetafield(shop, access_token, customerGID, productGID, definitionId,  existingValue);
                console.log("data ", data);
                } else if(data_type == "customer_account_page"){
                  console.log('else scope');
                  const data = await removeCustomerMetafield(shop, access_token, customerGID, product_id, existingValue);
                  console.log("data ", data);
                }
            } catch (error) {
                console.error("Error processing metafield:", error);
            }
        }
      


      

        return Response.json({ success: true, message: "Wishlist updated successfully." });

    } catch (error) {
        console.error('Error:', error.message);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
            console.log('Access denied. Check your access token and permissions.');
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: error.response?.status || 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
        });
    }



}
