export type OrderStatus = 'NEW' | 'DISPATCHED' | 'ACCEPTED' | 'REFUSED' | 'DELIVERED';

export interface Order {
  id: string;
  ref: string;
  ship_from: string;
  ship_to: string;
  windows: { start: string; end: string };
  pallets: number;
  weight: number;
  status: OrderStatus;
}

export interface DispatchPolicy {
  chain: string[]; // carrierIds
  slaAcceptHours: number;
}
