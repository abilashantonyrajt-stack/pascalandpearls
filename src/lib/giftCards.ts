export interface GiftCard {
  id?: string;
  code: string;
  amount: number;
  balance: number;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  message: string;
  createdAt: any;
  expiresAt: any;
  active: boolean;
}

export function generateGiftCardCode(): string {
  return "GC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}
