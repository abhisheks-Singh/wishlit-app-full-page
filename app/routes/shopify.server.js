// shopify.server.js
import { createMetafieldDefinition, checkMetafieldDefinitionExists } from "./components/createMetafieldDefinition";

export default {
  hooks: {
    afterAuth: async ({ session }) => {
      const metafieldExists = await checkMetafieldDefinitionExists({ session });
      if (!metafieldExists) {
        await createMetafieldDefinition({ session });
      }
    },
  },
};
