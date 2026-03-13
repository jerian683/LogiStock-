export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff';
}

export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category_name?: string;
  stock: number;
  min_stock: number;
  location: string;
}

export interface Transaction {
  id: number;
  item_id: number;
  item_name?: string;
  type: 'in' | 'out';
  quantity: number;
  user_id: number;
  staff_name?: string;
  person_name?: string;
  supplier?: string;
  notes?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalItems: number;
  totalStock: number;
  criticalItems: number;
  recentActivity: Transaction[];
  chartData: { date: string; usage: number }[];
}
