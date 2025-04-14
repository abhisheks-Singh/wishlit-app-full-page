import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Grid,
  LegacyCard,
  InlineGrid,
  Box,
  Text,
  Form,
  Icon,
  OptionList,
  Popover,
  Modal,
  Link,
} from "@shopify/polaris";
import "./assets/custom.css";
// import enableAddressEditorImage from "./assets/enable-address-editor.png";
import thankyouPage from "./assets/thankyou-page.png";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const storeDomain = url.hostname; // Extracts the domain only

  return storeDomain;
};

export default function Index() {
  const { storeDomain } = useLoaderData();
  // const storeDomain = window.location.href; // e.g., "abhishek-dev-storee.myshopify.com"
  // const designPageUrl = `https://${storeDomain}/admin/apps/addressease/app/design`;
  console.log("store domain ", storeDomain);

  return (
    <Box class="main-container-home margin-left-main bg-white" style={{ marginLeft: "15px", maxWidth:"60rem"}}>
      <Box class="margin-container">
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            paddingTop: "15px",
          }}
        >
          Read me
        </h1>
        <br />
        <h3 class="tracking-wide font-semibold">
          Installation steps are required for the Wishlist app to work
        </h3>

        <p class="prose prose-blue">
          Follow these steps to set up the Wishlist app in your Shopify store:
          <br />
          <br />
          <strong class="font-bold">1. Install the Wishlist App:</strong>
          <br />
          From your Shopify admin, go to **Apps** and click **Visit the Shopify
          App Store**. Search for "Wishlist App" and click on the app. Click{" "}
          **Add app** and follow the prompts to install the app.
          <br />
          <br />
          <strong class="font-bold">2. Enable Storefront Extension (Wishlist
          Page on Product Page):</strong>
          <br />
          After installing the app, navigate to the app's settings in your
          Shopify admin. Look for a section labeled **Storefront Extension** or{" "}
          **Product Page Integration**. Enable the extension by toggling a
          switch or clicking a button labeled **Enable**. This will add a
          "Wishlist" button or icon on your product pages, allowing customers
          to add products to their wishlist directly from the product page.
          <br />
          <br />
          <strong class="font-bold">3. Enable Customer Account Full Page
          Extension (Wishlist Page in Customer Account):</strong>
          <br />
          In the app settings, find a section labeled **Customer Account
          Integration**. Enable the full page extension by toggling a switch or
          clicking a button labeled **Enable**. This will create a dedicated
          "Wishlist" page in the customer's account section where they can view
          and manage their saved items.
          <br />
          <br />
          <strong class="font-bold">4. Add Wishlist to Customer Account Menu:</strong>
          <br />
          Go to your Shopify admin, then click **Online Store** **Navigation**.
          Select the **Customer Account Menu**. Click **Add menu item**. In the{" "}
          **Name** field, enter "Wishlist". In the **Link** field, search for
          your "Wishlist" app page that the app installed. Click **Add** to add
          the menu item. Click **Save menu**.
          <br />
          <br />
          <strong class="font-bold">5. Test the Wishlist App:</strong>
          <br />
          Go to your online store as a customer. Navigate to a product page and
          click the "Add to Wishlist" button. Create an account or log in to
          your existing customer account. Go to the Customer Account Menu and
          click on Wishlist. Verify that the product you added appears on your
          wishlist page. Try removing products from the wishlist to ensure the
          functionality is working correctly.
          <br />
          <br />
          If you are not confident to perform the installation steps, you can
          email me at{" "}
          <strong class="font-bold">abhishek.singh@centire.in</strong> and I
          will get back to you as soon as I can, to help you perform the
          installation step (for free).
          <br />
          <br />
          Please refer to the Privacy Policy and Data Protection Agreement to
          see what data is being accessed and stored by this app, all accessed
          data is used strictly for the app functionality only.
          <br />
          <br />
          <h3 class="tracking-wide font-semibold">
            Wishlist App allows customers to save their favorite products
          </h3>
          The Wishlist App is designed to make it easy for your customers to
          save their favorite products for future reference or purchase. This
          can increase customer engagement and potentially boost sales.
          <br />
          <br />
          <h3 class="tracking-wide font-semibold">
            Easy management and integration
          </h3>
          With the storefront and customer account extensions, integrating the
          wishlist functionality into your store is seamless and intuitive.
          <br />
          <br />
          {/* <h3 class="tracking-wide font-semibold">
            Control which orders can be edited using tags
          </h3>
          In the <Link to="#">Settings page</Link>, you can restrict which order
          that can be edited if they contain certain tag, or only allow order
          that has certain tag to be edited (eg: only allow order tagged with
          "preorder" to be able to edit shipping address).
          <br />
          <br />
          <h3 class="tracking-wide font-semibold">
            Limit editable address field, and customize look
          </h3>
          You can customize which address fields are editable by customers (eg:
          don't allow customer to change country as this would incur additional
          shipping cost for you) on the <Link to="#">Settings page</Link> (from
          the Settings tab above), and customize the look and text on the order
          status page box and dialog on the <Link to="#">Design page </Link>(from
          the Design tab above). */}
        </p>
      </Box>
      <br />
      <br />
      <br />
    </Box>
  );
}
