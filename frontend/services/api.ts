export const createTokenRecord = async (tokenData: any) => {
  const response = await fetch('/api/tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokenData),
  });
  return response.json();
};

export const recordTransaction = async (transactionData: any) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  return response.json();
};

export const getTokenTransactions = async (tokenAddress: string) => {
  const response = await fetch(`/api/transactions?tokenAddress=${tokenAddress}`);
  return response.json();
}; 