import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard") || 
                      req.nextUrl.pathname.startsWith("/api/dashboard") ||
                      req.nextUrl.pathname.startsWith("/api/leads/kanban") ||
                      req.nextUrl.pathname.startsWith("/api/quotes/smart");

  if (isDashboard && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin";
    return NextResponse.redirect(url);
  }

  // RBAC: Only Owners and Admins can access Dashboard APIs and Smart Quoting
  const role = (req.auth?.user as any)?.role;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/api/dashboard") || 
                       req.nextUrl.pathname.startsWith("/api/quotes/smart");

  if (isAdminRoute && role !== 'owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
