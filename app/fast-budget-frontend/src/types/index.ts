export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Quote {
  id: number;
  title: string;
  description?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  created_at: string;
  user_id: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  user_id: number;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  user_id: number;
}
