import {
  reactExtension,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  useApi,
  useApplyCartLinesChange,
  useInstructions,
  useTranslate,
  Button, 
  Image,
  View,
  useCartLines, 
  ProductThumbnail
} from "@shopify/ui-extensions-react/checkout";
// import { View } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

// Choose an extension target
export default reactExtension(
  "purchase.checkout.block.render",
   () => <Extension />
);

function Extension() {
  const translate = useTranslate();
  const { query, applyCartLinesChange, api } = useApi();
  const cartLines = useCartLines();
  const instructions = useInstructions();
  const settings = useApi().settings.current;

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('api data ', useApi());
  console.log("cart lines data ", cartLines);
  console.log("settings current", settings);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await query(`{
          products(first: 2, query: "tag:upsell") {
            edges {
              node {
                id
                title
                featuredImage { url }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price { amount }
                    }
                  }
                }
              }
            }
          }
        }`);
        
        // Filter out products already in cart
        const filteredProducts = data.products.edges.map(edge => edge.node)
          .filter(product => !isProductInCart(product, cartLines));
  
        setProducts(filteredProducts);
      } catch (err) {
        setError(err.message);
      }
    }
    
    fetchProducts();
  }, [cartLines]);
  

  const isProductInCart = (product, cartLines) => {
    console.log('product', product, 'cartLines', cartLines);
    const productVariantId = product.variants.edges[0].node.id;
    return cartLines.some(cartLine => cartLine.merchandise.id === productVariantId);
  };
  
  const addToCart = async (variantId) => {
    setLoading(true);
    try {
      if (cartLines.some(cartLine => cartLine.merchandise.id === variantId)) {
        console.log('Product is already in cart.');
        return;
      }
  
      const result = await applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: variantId,
        quantity: 1,
        attributes: [] // Required even if empty
      });
  
      if (result.type === 'error') {
        throw new Error(result.message);
      }
  
      console.log('Successfully added:', result);
      
    } catch (err) {
      console.error('Add to cart error:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };
  

  if (error) return <Banner status="critical">{error}</Banner>;

  // Render UI
  return (
    <>
      {settings.content_type === "info" ||
      settings.content_type === "success" ||
      settings.content_type === "warning" ||
      settings.content_type === "critical" ? (
        <Banner
          inlineAlignment={settings.alignment}
          spacing="loose"
          status={settings.content_type}
          title={settings.title}
          collapsible={settings.collapsible}
        >
          <Text size={settings.font_size} alignment={settings.alignment}>
            {settings.description}
          </Text>
        </Banner>
      ) : settings.content_type === "image" ? (
        <Image source={settings.image_url} alt={settings.title} />
      ) : settings.content_type === "upsell" ? (
        <BlockStack spacing="loose">
          <Text size="large" alignment="center">
            Recommended Products
          </Text>
          {products.map((product) => (
            <InlineStack key={product.id} spacing="base">
              {/* Left Side - Image */}
              <BlockStack>
                <ProductThumbnail
                  source={product.featuredImage?.url}
                  border="none"
                />
              </BlockStack>

              {/* Right Side - Details */}
              <BlockStack spacing="none">
                <Text size="small" emphasis="bold">
                  {product.title}
                </Text>
                <Text size="small" emphasis="bold">
                  ${product.variants.edges[0]?.node?.price?.amount || "0.00"}
                </Text>
              </BlockStack>

              {/* Add to Cart Button - Below */}
              <Button
                size="base"
                onPress={() => {
                  if (product.variants.edges[0]?.node?.id) {
                    addToCart(product.variants.edges[0].node.id);
                  }
                }}
              >
                Add to Cart
              </Button>
            </InlineStack>
          ))}
        </BlockStack>
      ) : (
        <BlockStack
          spacing="tight"
          inlineAlignment={settings.alignment}
          collapsible={settings.collapsible}
        >
          <Text size="medium">{settings.title}</Text>
          <Text
            size={settings.font_size}
            appearance={settings.appearance}
            emphasis={settings.appearance === "bold" ? "bold" : undefined}
          >
            {settings.description}
          </Text>
          <Button onPress={console.log('hello')}>Refresh Checkout Lines</Button>{" "}
          {/* Button to trigger refresh */}
        </BlockStack>
      )}
    </>
  );
}


// function UpsellProducts() {
//   const { query, applyAttributeChange, api } = useApi();
//   const api_data  = useApi();
//   console.log('api data ', api_data);


//   // Example usage: Log the checkout token
//   // console.log("Current Checkout Token:", checkoutToken);

//   const applyCartLinesChange = useApplyCartLinesChange();
//   const [products, setProducts] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);


//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const { data } = await query(`{
//           products(first: 2, query: "tag:upsell") {
//             edges {
//               node {
//                 id
//                 title
//                 featuredImage { url }
//                 variants(first: 1) {
//                   edges {
//                     node {
//                       id
//                       price { amount }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }`);
        
//         setProducts(data.products.edges.map(edge => edge.node));
//       } catch (err) {
//         setError(err.message);
//       }
//     }
    
//     fetchProducts();
//   }, []);

//   const addToCart = async (variantId) => {
//     setLoading(true);
//     try {
//       // Properly structured cart line change
//       const result = await applyCartLinesChange({
//         type: "addCartLine",
//         merchandiseId: variantId,
//         quantity: 1,
//         attributes: [] // Required even if empty
//       });

//       // Handle result properly
//       if (result.type === 'error') {
//         throw new Error(result.message);
//       }

//       console.log('Successfully added:', result);
      
//     } catch (err) {
//       console.error('Add to cart error:', err);
//       setError(err.message || 'Failed to add product');
//     } finally {
//       setLoading(false);
//     }
//   };


//   if (error) return <Banner status="critical">{error}</Banner>;
  
//   return (
//     <BlockStack spacing="loose">
//     <Text size="large" alignment="center">Recommended Products</Text>
//     {products.map(product => (
//      <InlineStack key={product.id} spacing="base">
//       {/* Left Side - Image */}
//       <BlockStack>
//        <ProductThumbnail
//         source={product.featuredImage?.url}
//         border="none"
        
//        />
//       </BlockStack>

//       {/* Right Side - Details */}
//        <BlockStack spacing="none">
//         <Text size="small" emphasis="bold">{product.title}</Text>
//         <Text size="small" emphasis="bold">
//           ${product.variants.edges[0]?.node?.price?.amount || '0.00'}
//         </Text>
//        </BlockStack>

//        {/* Add to Cart Button - Below */}
//       <Button
//       size="base"
//         onPress={() => {
//           if (product.variants.edges[0]?.node?.id) {
//             addToCart(product.variants.edges[0].node.id);
//           }
//         }}
//       >
//         Add to Cart
//       </Button>
//   </InlineStack>
//   ))}
// </BlockStack>
// );
// }