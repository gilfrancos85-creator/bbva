export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  balance: number;
  isActive: boolean;
  createdAt: number;
  card: VirtualCard;
}

export interface VirtualCard {
  cardNumber: string;
  cvv: string;
  expiry: string;
  type: "VISA" | "MASTERCARD";
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out";
  amount: number;
  description: string;
  timestamp: number;
  balanceAfter: number;
  counterpartEmail?: string;
}