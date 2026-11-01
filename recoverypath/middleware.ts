import { NextResponse, type NextRequest } from "next/server";

/** Basic-auth gate for the legal-content admin. */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") return new NextResponse("Admin disabled: set ADMIN_PASSWORD", { status: 403 });
    return NextResponse.next();
  }
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [, pass] = atob(encoded).split(":");
    if (pass === password) return NextResponse.next();
  }
  return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="RecoveryPath admin"' } });
}

export const config = { matcher: ["/admin/:path*"] };
