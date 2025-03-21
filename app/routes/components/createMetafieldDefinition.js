// createMetafieldDefinition.js

import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";

export async function createMetafieldDefinition({ session }) {
  const query = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          namespace
          key
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    definition: {
      name: "Wishlist",
      namespace: "wishlist-app",
      key: "products",
      description: "A list of products in the customer's wishlist.",
      type: "list_of_products",
      ownerType: "CUSTOMER",
    },
  };

  try {
    const response = await restResources.client.graphql({
      query,
      variables,
      session,
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error creating metafield definition:', error);
  }
}

// Function to check if metafield definition exists
export async function checkMetafieldDefinitionExists({ session }) {
    const query = `
      query {
        metafieldDefinitions(first: 10, namespace: "wishlist-app", key: "products") {
          edges {
            node {
              id
              name
              namespace
              key
            }
          }
        }
      }
    `;
  
    try {
      const response = await restResources.client.graphql({
        query,
        session,
      });
  
      const data = await response.json();
      return data.data.metafieldDefinitions.edges.length > 0;
    } catch (error) {
      console.error('Error checking metafield definition:', error);
      return false;
    }
  }
  
