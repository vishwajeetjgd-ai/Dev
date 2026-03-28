// Format number as Indian Rupee currency
export const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};
