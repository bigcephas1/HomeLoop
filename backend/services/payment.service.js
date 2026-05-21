export const initializePayment = async (data) => {
  return {
    success: true,
    data,
  };
};

export const verifyPayment = async (reference) => {
  return {
    success: true,
    reference,
  };
};
