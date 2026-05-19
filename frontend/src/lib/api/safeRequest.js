export const safeRequest = async (requestFn, { onError } = {}) => {
  try {
    const data = await requestFn();
    return { data, error: null };
  } catch (error) {
    if (typeof onError === 'function') {
      onError(error);
    }
    return { data: null, error };
  }
};
