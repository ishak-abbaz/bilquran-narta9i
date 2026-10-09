import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  updateSession,
} from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest,
) {
  const {
    response,
    user,
  } =
    await updateSession(
      request,
    );

  const pathname =
    request.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith(
      "/admin",
    );

  const isLoginPage =
    pathname ===
    "/admin/login";

  if (
    isAdminRoute &&
    !isLoginPage &&
    !user
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname =
      "/admin/login";

    redirectUrl.search =
      "";

    return NextResponse.redirect(
      redirectUrl,
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};