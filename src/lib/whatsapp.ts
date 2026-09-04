import type { Order } from './types';

function sanitizeMobile(mobile?: string) {
  if (!mobile) return '';
  // keep digits only
  const digits = mobile.replace(/\D/g, '');
  // take last 10 digits if longer
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function buildReceiptText(order: Order) {
  const lines: string[] = [];
  lines.push('🍔 *Bhukkad Cafe - Order Receipt* 🍔');
  lines.push('');
  lines.push(`Order Number: ${order.order_number}`);
  lines.push(`Date: ${new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`);
  if (order.customer_name) lines.push(`Customer: ${order.customer_name}`);
  if (order.mobile_number) lines.push(`Mobile: +91 ${sanitizeMobile(order.mobile_number)}`);
  if (order.table_number) lines.push(`Table: ${order.table_number}`);
  lines.push('');
  lines.push('Items:');
  (order.order_items || []).forEach((oi) => {
    const qty = oi.quantity ?? 1;
    const subtotal = (Number(oi.price) * qty) || 0;
    lines.push(`${qty} x ${oi.item_name} - ₹${subtotal.toFixed(2)}`);
  });
  lines.push('');
  lines.push(`Total: ₹${Number(order.total).toFixed(2)}`);
  lines.push('');
  lines.push('Thank you for dining with Bhukkad Cafe! ❤️');
  return lines.join('\n');
}

export function getWhatsAppUrl(order: Order) {
  const text = buildReceiptText(order);
  const encoded = encodeURIComponent(text);
  const mobile = sanitizeMobile(order.mobile_number);
  if (mobile) {
    return `https://wa.me/91${mobile}?text=${encoded}`;
  }
  // fallback: open chat without number so user can choose recipient
  return `https://wa.me/?text=${encoded}`;
}
