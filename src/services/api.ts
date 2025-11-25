import { API_BASE_URL, getAuthHeaders } from '@/config/api';

// -------------------- Auth API --------------------
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }
};

// -------------------- Savings Account API --------------------
export const savingsAccountAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/savings-accounts`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch savings accounts');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/savings-accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create savings account');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/savings-accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update savings account');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/savings-accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete savings account');
  }
};

// -------------------- Mutual Fund API --------------------
export const mutualFundAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch mutual funds');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create mutual fund');
    return response.json();
  },

  addUnits: async (id: string, units: number, nav: number, purchaseDate: string) => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds/${id}/add-units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ units, nav, purchaseDate })
    });
    if (!response.ok) throw new Error('Failed to add units');
    return response.json();
  },

  getTransactions: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds/${id}/transactions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getAllTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds/transactions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch all transactions');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update mutual fund');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/mutual-funds/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete mutual fund');
  }
};

// -------------------- Fixed Deposit API --------------------
export const fixedDepositAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/fixed-deposits`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch fixed deposits');
    return response.json();
  },
  
  create: async (data: any) => {
    // Ensure maturityDate is in ISO format
    const formattedData = {
      ...data,
      maturityDate: data.maturityDate ? new Date(data.maturityDate).toISOString().split('T')[0] : null
    };
    
    const response = await fetch(`${API_BASE_URL}/fixed-deposits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedData)
    });
    if (!response.ok) throw new Error('Failed to create fixed deposit');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const formattedData = {
      ...data,
      maturityDate: data.maturityDate ? new Date(data.maturityDate).toISOString().split('T')[0] : null
    };
    
    const response = await fetch(`${API_BASE_URL}/fixed-deposits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedData)
    });
    if (!response.ok) throw new Error('Failed to update fixed deposit');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/fixed-deposits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete fixed deposit');
  }
};

// Stock API
export const stockAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/stocks`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return response.json();
  },
  
  create: async (data: any) => {
    // Ensure purchaseDate is in ISO format
    const formattedData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null
    };
    
    const response = await fetch(`${API_BASE_URL}/stocks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedData)
    });
    if (!response.ok) throw new Error('Failed to create stock');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const formattedData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null
    };
    
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedData)
    });
    if (!response.ok) throw new Error('Failed to update stock');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete stock');
  }
};


// -------------------- Expense API --------------------
export const expenseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete expense');
  }
};

// -------------------- Income API --------------------
export const incomeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/incomes`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch incomes');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/incomes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create income');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete income');
  }
};

// -------------------- Trip API --------------------
export const tripAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch trips');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create trip');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update trip');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete trip');
  },

  getExpenses: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch trip expenses');
    return response.json();
  },

  addExpense: async (tripId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add expense');
    return response.json();
  },

  updateExpense: async (tripId: string, expenseId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update expense');
    return response.json();
  },

  deleteExpense: async (tripId: string, expenseId: string) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete expense');
  }
};
