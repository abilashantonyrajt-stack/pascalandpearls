export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admin = process.env.ADMIN_EMAIL || "";
  return email.toLowerCase() === admin.toLowerCase();
}

export function verifyAdminRequest(req: Request): { authorized: boolean; email?: string } {
  const email = req.headers.get("x-admin-email");
  if (!email || !isAdminEmail(email)) return { authorized: false };
  return { authorized: true, email };
}
