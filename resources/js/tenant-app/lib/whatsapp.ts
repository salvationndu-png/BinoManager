const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

/** Normalise a Nigerian phone number to international format for wa.me */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  return '234' + digits;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export function openWhatsAppReceipt(
  phone: string,
  customerName: string,
  items: ReceiptItem[],
  total: number,
  paymentType: string,
  tenantName: string,
) {
  const date = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const lines = items.map(i => `  • ${i.name} x${i.quantity} — ${fmt(i.price * i.quantity)}`).join('\n');

  const text = [
    `🧾 *Receipt — ${tenantName}*`,
    `📅 ${date}`,
    customerName ? `👤 ${customerName}` : null,
    ``,
    lines,
    ``,
    `*Total: ${fmt(total)}*`,
    `💳 Payment: ${paymentType} ✅`,
    ``,
    `Thank you for your business! 🙏`,
  ].filter(l => l !== null).join('\n');

  const url = `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function openWhatsAppReminder(
  phone: string,
  customerName: string,
  outstandingBalance: number,
  tenantName: string,
) {
  const text = [
    `Hello ${customerName} 👋`,
    ``,
    `This is a reminder from *${tenantName}*.`,
    ``,
    `You have an outstanding balance of *${fmt(outstandingBalance)}*.`,
    ``,
    `Please contact us to arrange payment at your earliest convenience.`,
    ``,
    `Thank you 🙏`,
  ].join('\n');

  const url = `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
