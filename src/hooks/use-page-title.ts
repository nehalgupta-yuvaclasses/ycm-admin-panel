import { useEffect } from "react";
import { adminRoutes } from "@/routes";

const DEFAULT_TITLE = "Yuva Classes Admin";

const PAGE_TITLES: Record<string, string> = {
  "/login": "Login",
  "/unauthorized": "Unauthorized",
};

export function getPageTitle(pathname: string) {
  if (pathname === "/" || pathname === "/admin") {
    return "Dashboard";
  }

  const adminRoute = adminRoutes.find((route) => {
    if (route.path === pathname) return true;

    if (route.path.includes(":")) {
      const basePath = route.path.split(":")[0].replace(/\/$/, "");
      return pathname.startsWith(basePath);
    }

    return false;
  });

  if (adminRoute) {
    return adminRoute.label;
  }

  return PAGE_TITLES[pathname] ?? "";
}

export function buildDocumentTitle(pageName?: string) {
  return pageName ? `${pageName} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
}

export function usePageTitle(pageName?: string) {
  useEffect(() => {
    document.title = buildDocumentTitle(pageName);
  }, [pageName]);
}