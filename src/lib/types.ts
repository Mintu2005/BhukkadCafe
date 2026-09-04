export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  icon: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_popular: boolean;
  is_available: boolean;
  display_order: number;
  created_at: string;
  category?: Category | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'rejected';

export type OrderType = 'dine_in' | 'takeaway';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  mobile_number: string;
  order_type: OrderType;
  table_number: string | null;
  special_instructions: string | null;
  status: OrderStatus;
  subtotal: number;
  total: number;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
];

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
};
