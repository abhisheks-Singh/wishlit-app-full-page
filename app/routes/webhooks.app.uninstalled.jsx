import { authenticate } from "../shopify.server";
import db from "../db.server"; // Replace with your database utility

export const action = async ({ request }) => {
  // Authenticate and parse the webhook request
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Ensure idempotency: check if session exists before attempting deletion
  if (session) {
    try {
      // Delete the session record for the shop
      await db.session.deleteMany({ where: { shop } }); // Adjust query for your DB schema
      console.log(`Session for shop ${shop} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting session for shop ${shop}:`, error);
    }
  }

  return new Response(null, { status: 200 });
}; 
