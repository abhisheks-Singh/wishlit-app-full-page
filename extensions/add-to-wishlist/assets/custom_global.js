$(document).ready(async function () {
  console.log("hello world!");

  // Function to check if the current product is in the wishlist
  async function checkWishlist() {
    // Get dynamic values for shop and customer ID
    const shopUrl = $('.btn-wishlist').attr("data-shop-url");
    const customerId = $('.btn-wishlist').attr("data-customer-id");
    const productId = $('.btn-wishlist').attr("data-product-id");
    const shopName = new URL(shopUrl).hostname;

    try {
      // Make API request to fetch wishlist with the bypass header
      const response = await fetch(`https://a654-106-219-158-119.ngrok-free.app/api/server?shop=${shopName}&customer_Id=${customerId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true' // Add this header to skip the warning page
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const wishlistData = await response.json();
      console.log("Wishlist Data:", wishlistData);

      // Check if the current product ID is in the wishlist
      if (wishlistData.includes(`gid://shopify/Product/${productId}`)) {
        // Update button text if product is in the wishlist
        $('.btn-wishlist').text("Added to Wishlist");
        $(".btn-wishlist").css({
          "background-color": "#4CAF50",
          "color": "white"
        });
        
      } else {
        $('.btn-wishlist').text("Add to Wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist data:", error);
    }
  }

  
  await checkWishlist();

  
  $('.btn-wishlist').click(async function (e) {
    e.preventDefault(); // Prevent default action if needed

    let customer_id = parseInt($(this).attr("data-customer-id"));
    let product_id = parseInt($(this).attr("data-product-id"));
    let shop_url = $(this).attr("data-shop-url");
    let shop_name = new URL(shop_url).hostname;

    console.log("Customer ID:", customer_id, "Product ID:", product_id, 'Shop Name:', shop_name);

    // Prepare the request payload
    const requestData = {
      customer_id: customer_id,
      product_id: product_id,
      shop: shop_name, 
      data_type: 'product_page'
    };

    try {
      const response = await fetch('https://a654-106-219-158-119.ngrok-free.app/api/server', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': 'true' // Add this header to skip the warning page
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Response:", responseData);
      alert("Product added to wishlist!");
      
      // Recheck and update button text after action
      await checkWishlist();
      
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Error sending data: " + error.message);
    }
  });
});
