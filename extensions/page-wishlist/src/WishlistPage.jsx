// import { Banner } from "@shopify/polaris";
import {
  reactExtension,
  Grid,
  BlockStack,
  InlineStack,
  Link,
  Image,
  Text,
  Page,
  Button,
  useCartLines,
  useCustomer,
  Card, 
  TextBlock,
  Banner,
  View,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";

export default reactExtension(
  "customer-account.page.render",
  () => <WishlistPage />
);

function WishlistPage() {
  const [data, setData] = useState();
  const app_url = 'https://a654-106-219-158-119.ngrok-free.app';
  // const {query}  = useApi();
  const api = useApi();
  const { i18n } = useApi();
  const query = api.query;
  const customer_id = api.authenticatedAccount.customer.current.id;
  const [shop_domain, setShopDomain] = useState();
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  // console.log('api', api.authenticatedAccount.customer.current.id, 'customer id ', customer_id); 
  console.log('shop domain', shop_domain);



  // const { buyerIdentity } = useApi();
  // const customer = buyerIdentity.customer;
  // console.log("customer data ", customer);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await query(`
          query {
            shop {  
              name
              primaryDomain {
                url
              }
            }
          }
        `);
        const { data, errors } = response;

        if (errors) {
          console.error('GraphQL Errors:', errors);
        } else {
          setData(data);
          setShopDomain(data.shop.primaryDomain.url);
        }
      } catch (error) {
        console.error('Network Error:', error);
      }
    };

    fetchData();
  }, [query]);

  console.log("data: ", JSON.stringify(data));

  console.log('api', api.authenticatedAccount.customer.current.id, 'customer id ', customer_id, 'shop domain url ', shop_domain);




  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(
          `${app_url}/api/server?shop=${shop_domain}&customer_Id=${customer_id}`,
          {
              headers: {
                  'ngrok-skip-browser-warning': 'true' // Add this header to skip the warning page
              }
          }
      );
  
      if (!response.ok) {
          const errorText = await response.text(); // Get error message from response
          throw new Error(`Failed to fetch wishlist: ${errorText}`);
      }
  
      const data = await response.json();
      const parsedWishlistIds = JSON.parse(data);
      setWishlistProductIds(parsedWishlistIds);
      console.log('Fetched data:', data, 'parsed product ids ', parsedWishlistIds);
  }
    catch (err) {
        console.error('Error fetching wishlist:', err); // Log detailed error
        setError(err.message);
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    if (shop_domain) { // Only call fetchWishlist if shop_domain is defined
      fetchWishlist();
    }
  }, [shop_domain]); 

  // products data : 

  useEffect(() => {
    const fetchData = async () => {
      console.log('Wishlist product IDs:', wishlistProductIds);
      
      // Ensure there are valid IDs
      const validWishlistProductIds = wishlistProductIds.filter(id => id && typeof id === 'string');
  
      if (validWishlistProductIds.length === 0) {
        console.error('No valid product IDs to query.');
        return;
      }
  
      const queryString = `
        query GetProductsByIds($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title 
              handle
              images(first: 10) {
                edges {
                  node {
                    id
                    altText
                    originalSrc
                    transformedSrc(maxWidth: 500, maxHeight: 500)
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price: priceV2 {
                      amount
                      currencyCode
                    }
                    compareAtPrice: compareAtPriceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      `;
  
      try {
        console.log('Query Variables:', { ids: wishlistProductIds });
        const response = await query(queryString, { variables: { ids: validWishlistProductIds } });

        const { data, errors } = response;
  
        if (errors) {
          console.error("GraphQL Errors:", errors);
        } else {
          // Check if data.nodes is not null or undefined before setting state
          if (data.nodes) {
            setWishlistProducts(data.nodes);
          } else {
            console.warn("No products found for the provided IDs.");
          }
        }
      } catch (error) {
        console.error("Network Error:", error);
      }
    };
  
    fetchData();
  }, [wishlistProductIds, query]);
  
  

  console.log('wishlist products ', wishlistProducts);
  console.log('wishlist product ids ', JSON.stringify(wishlistProductIds));

  // const addToCart = async (product) => {
  //   try {
  //     await addLines([{
  //       merchandiseId: product.variants.nodes[0].id,
  //       quantity: 1
  //     }]);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  const removeProduct = async (productId) => {
    const shop = new URL(shop_domain).hostname;
    console.log("removeProduct called", shop, productId);
    console.log("ProductId: " + productId, 'fn called remove Product');
    try {
      const response = await fetch(`${app_url}/api/server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          shop: shop,
          customer_id: customer_id,
          product_id: productId,
          data_type: "customer_account_page",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove product: ${errorText}`);
      }

      const result = await response.json();
      console.log('Product removed successfully:', result);
      // Refresh wishlist after removing product
      fetchWishlist();
    } catch (error) {
      console.error('Error removing product:', error);
      setError(error.message);
    }
  };

  if (loading) return <Text>Loading wishlist...</Text>;
  if (error) return <Banner status="critical">{error}</Banner>;

  return (
    <Page title="WISHLIST PRODUCTS">
      
      <BlockStack spacing="loose">
        {wishlistProducts.length === 0 ? (
          <Banner status="info">
            <TextBlock>Your wishlist is empty</TextBlock>
          </Banner>
        ) : (
          <InlineStack
            columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            spacing="extraLoose"
            padding="base"
          >
            {wishlistProducts.map((product) => (
              <View
                key={product.id}
                padding="base"
                border="base"
                borderRadius="large"
                // maxInlineSize={300}
                
              >
                <BlockStack spacing="tight">
                  {/* Product Image with Link */}
                  <Link
                    to={`${shop_domain}/products/${product.handle}`}
                    overlay
                    pressed={false}
                  >
                    <Image
                      source={product.images.edges[0]?.node.transformedSrc || ""}
                      alt={product.images.edges[0]?.node.altText || product.title}
                      aspectRatio={1}
                      fit="cover"
                      borderRadius="base"
                    />
                  </Link>
                  {/* Product Info */}
                  <BlockStack spacing="extraTight">
                    <Link
                      to={`${shop_domain}/products/${product.handle}`}
                      tone="subdued"
                      underline="none"
                    >
                      <TextBlock size="medium" emphasis="bold">
                        {product.title}
                      </TextBlock>
                    </Link>
                   <InlineStack>
                    {/* Pricing */}
                    <TextBlock tone="critical" emphasis="bold">
                      ₹{product.variants.edges[0]?.node.price.amount}
                    </TextBlock>
                      {/* {product.variants.edges[0]?.node.compareAtPrice && (
                        <TextBlock tone="subdued" emphasis="strikethrough">
                          ₹{product.variants.edges[0]?.node.compareAtPrice.amount}
                        </TextBlock>
                      )} */}
                    </InlineStack>
                  </BlockStack>

                  {/* Action Buttons */}
                  <InlineStack spacing="base" blockAlignment="center">
                    <Button
                      
                      variant="secondary"
                      size="micro"
                      onPress={() => removeProduct(product.id)}
                    >
                      Remove
                    </Button>
                    <Link to={`${shop_domain}/products/${product.handle}`}>
                    <Button
                  variant="primary"
                  size="micro"
                  // onPress={() => {
                  //   api.navigate(`${shop_domain}/products/${product.handle}`);
                  // }}
                >
                  Product Page
                </Button>
                </Link>
                  </InlineStack>
                </BlockStack>
              </View>
            ))}
          </InlineStack>
        )}
      </BlockStack>
    </Page>
  );
  
  
}
