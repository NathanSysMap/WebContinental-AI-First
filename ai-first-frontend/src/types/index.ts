// ---- Users ----
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  products?: Product[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

// ---- Products ----
export interface Product {
  id: number; // Prisma Int
  name: string;
  description?: string | null;
  price: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  brand?: string | null;
  model?: string | null;
  voltage?: string | null;
  category?: string | null;
  subcategory?: string | null;
  imageUrl?: string | null;
  stock: number;
  active: boolean;
  tags: string[];
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  productsHistory?: ProductHistory[];
}

export interface ProductHistory {
  id: number; // Prisma Int
  productId: number;
  name: string;
  description?: string | null;
  price: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  brand?: string | null;
  model?: string | null;
  ean?: string | null;
  voltage?: string | null;
  category?: string | null;
  subcategory?: string | null;
  imageUrl?: string | null;
  stock: number;
  active: boolean;
  tags: string[];
  action: string;
  changedBy: string;
  createdAt: string;
}

// ---- Customers ----
export interface Customer {
  id: string; // Prisma String (uuid)
  name: string;
  phone: string;
  email?: string | null;
  cpf: string;
  addresses: CustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerAddress {
  id: string; // Prisma String (uuid)
  customerId: string;
  zipCode: string;
  street: string;
  number: string;
  city: string;
  state: string;
  createdAt?: string;
  updatedAt?: string;
}

// ---- Orders ----
export type OrderStatus =
  | 'ABERTO'
  | 'ACEITO'
  | 'RECUSADO'
  | 'PREPARACAO'
  | 'DESLOCAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'SUSPENSO';

export type Shift = 'MANHA' | 'TARDE';

export interface OrderItem {
  id: number; // Prisma Int
  productId: number;
  orderId: number;
  quantity: number;
  unitPrice: number;
  name: string;
  imageUrl?: string | null;
  product?: Product; // pode vir via include
  order?: Order;
}

export interface Order {
  id: number; // Prisma Int
  total: number;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  items: OrderItem[];
  customer: Customer;
  status: OrderStatus;
  shippingCost: number;
  shippingMethod: string;

  // Novos/alterados conforme schema
  deliveryMinDate?: string | null;
  installerId?: string | null;
  assemblyDate?: string | null;
  shift: Shift; // no schema não é nullable
  installer?: Installer | null;
}

// ---- Cart ----
export type CartStatus = 'ATIVO' | 'FINALIZADO' | 'ABANDONADO';

export interface CartItem {
  id: number; // Prisma Int
  quantity: number;
  productId: number;
  cartId: number;
  name: string;
  unitPrice: number;
  product?: Product;
  cart?: Cart;
}

export interface Cart {
  id: number; // Prisma Int
  customerId?: string | null;
  customerPhone: string;
  items: CartItem[];
  totalWeight?: number | null;
  /** Atenção: o schema tem 'totalHeigt' (typo). O backend enviará esse nome. */
  totalHeigt?: number | null;
  totalWidth?: number | null;
  totalLength?: number | null;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- Installers ----
export interface Installer {
  id: string; // Prisma String (uuid)
  name: string;
  cpf: string;
  phone: string;
  email?: string | null;
  active: boolean;
  city: string;
  state: string;
  availability?: InstallerAvailability[];
  orders?: Order[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InstallerAvailability {
  id: number; // Prisma Int
  installerId: string;
  date: string; // DateTime
  shift: Shift;
  available: boolean;
  installer?: Installer;
  createdAt?: string;
  updatedAt?: string;
}

// ---- Agent content ----
export interface AgentPrompt {
  id: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDocument {
  id: string;
  name: string;
  fileUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}