import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export interface StatusEvent {
  status: string;
  timestamp: number;
  note?: string;
}

export interface Order {
  id?: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "upi" | "cod";
  paymentStatus: "pending" | "completed" | "failed";
  fulfillmentStatus: "pending" | "shipped" | "delivered" | "cancelled";
  statusHistory: StatusEvent[];
  transactionId?: string;
  trackingNumber?: string;
  notes?: string;
  discountPercent?: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  subtotal?: number;
  shipping?: number;
  createdAt: Timestamp;
}

const ORDERS_COLLECTION = "orders";

export async function createOrder(
  order: Omit<Order, "id" | "createdAt">
) {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const q = query(collection(db, ORDERS_COLLECTION), where("customerDetails.email", "==", email));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}
