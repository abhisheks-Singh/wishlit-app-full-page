// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**availabavailableForSale {quantleForSale {quant
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log('New cart line detected:', JSON.stringify(input.cart.lines)); // This will log in Shopify's function logs

  // Example logic to detect new cart lines
  if (input.cart.lines.length > 0) {
    console.log('Cart line details:', JSON.stringify(input.cart.lines[0]));
  }

  return NO_CHANGES; 
};
