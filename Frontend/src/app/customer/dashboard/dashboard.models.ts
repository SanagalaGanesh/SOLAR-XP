export enum QuoteStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  ORDERED = 'Ordered',
  DECLINED = 'Declined'
}

export interface QuoteItem {
  itemId: number;
  product: string;
  price: string;
  status: QuoteStatus;
  type?: string;
  wattage?: string;
  canBuy?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quote {
  quoteId: number;
  userId: number;
  date: string;
  address: string;
  mobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  items: QuoteItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface ChatState {
  currentStep: string;
  savedPurpose: string;
  savedBill: string;
  savedCuts: string;
}

export interface User {
  userId: number;
  userName: string;
  email?: string;
  role?: string;
}

export interface QuoteRequest {
  userId: number;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  selectedTypes: string[];
  selectedWatts: number[];
}

export interface OrderRequest {
  itemId: number;
  userId: number;
  acceptTerms: boolean;
}