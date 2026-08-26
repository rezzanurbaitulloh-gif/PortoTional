import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "portotional.com"
).toLowerCase();

function resolveSubdomain(host: string): string | null {
  const h = host.split(":")[0].toLowerCase();
  if (h === ROOT_DOMAIN || h === `www.${ROOT_DOMAIN}` || h === "localhost") {
    return null;
  }
  if (h.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = h.slice(0, -(ROOT_DOMAIN.length + 1));
    return sub && sub !== "www" ? sub : null;
  }
  if (h.endsWith(".lvh.me")) {
    const parts = h.split(".");
    if (parts.length >= 3 && parts[0] !== "www") return parts[0];
    return null;
  }
  return null;
}

const PROTECTED_PREFIXES = ["/app", "/onboarding"];
const AUTH_PAGES = ["/login", "/signup"];

/** §79 — set MAINTENANCE_MODE=1 (env) to show the maintenance page. Admins bypass. */
const MAINTENANCE_EXEMPT = [
  "/maintenance",
  "/login",
  "/auth",
  "/app/admin",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (
    process.env.MAINTENANCE_MODE === "1" &&
    !MAINTENANCE_EXEMPT.some((p) => pathname.startsWith(p)) &&
    !pathname.match(/\.(svg|png|jpg|jpeg|webp|ico)$/)
  ) {
    const isAdmin = user
      ? await (async () => {
          const { data: prof } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("user_id", user.id)
            .maybeSingle();
          return Boolean(prof?.is_admin);
        })()
      : false;
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

  const sub = resolveSubdomain(request.headers.get("host") ?? "");

  if (sub) {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${sub}${pathname}`;
    if (pathname === "/") url.pathname = `/sites/${sub}`;
    return NextResponse.rewrite(url);
  }

  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-.*\\.png|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
