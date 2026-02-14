import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/admin", "/juegos/nuevo"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Skip auth check for server action requests — they have their own requireAdmin() checks
  const isServerAction = request.headers.get("next-action") !== null;
  if (isServerAction) return response;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === "/auth/login";

  // Only run Supabase auth check when needed
  if (!isProtected && !isLoginPage) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Env vars missing — don't block the app
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected) {
      if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }

    // If already logged in and going to /auth/login, redirect to /admin
    if (isLoginPage && user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } catch {
    // Auth check failed — let the request through on public routes
    if (isProtected) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
