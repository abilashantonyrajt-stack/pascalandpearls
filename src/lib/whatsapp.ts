export function waLink(phone: string, message: string): string {
  return `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
