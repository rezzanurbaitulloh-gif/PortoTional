export function appUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://portotional.vercel.app"
  );
}

export function isCustomDomainAttached(): boolean {
  return !appUrl().includes("vercel.app");
}

export function websiteUrl(username: string): string {
  if (isCustomDomainAttached()) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "portotional.com";
    return `https://${username}.${rootDomain}`;
  }
  return `${appUrl()}/sites/${username}`;
}

export function websiteDisplayHost(username: string): string {
  return websiteUrl(username).replace(/^https?:\/\//, "");
}

