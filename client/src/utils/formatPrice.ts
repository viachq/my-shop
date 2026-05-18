export function formatPrice(raw: string | number): string {
  const n = typeof raw === 'number' ? raw : parseFloat(raw);
  if (isNaN(n)) return String(raw);
  const rounded = Number.isInteger(n) ? n.toString() : n.toFixed(2);
  const [whole, decimal] = rounded.split('.');
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decimal && decimal !== '00' ? `${spaced}.${decimal}` : spaced;
}
