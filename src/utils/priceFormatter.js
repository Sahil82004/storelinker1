/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted price with ₹ symbol and thousands separators
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formats a number as Indian Rupees (INR) without the currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted price with thousands separators
 */
export const formatPriceWithoutSymbol = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}; 