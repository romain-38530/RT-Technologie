export interface OrderCreatedEvent {
  type: 'order.created';
  timestamp: string; // ISO
  orderId: string;
}

export const OrderCreatedSchema = {
  $id: 'events/order.created',
  type: 'object',
  properties: {
    type: { const: 'order.created' },
    timestamp: { type: 'string', format: 'date-time' },
    orderId: { type: 'string' }
  },
  required: ['type', 'timestamp', 'orderId']
} as const;
