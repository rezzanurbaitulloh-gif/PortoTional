/**
 * PRD v3 §21 — RBAC. Least privilege, server-side only.
 * Frontend visibility is never the security boundary.
 */

export const ROLES = ["USER", "SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "users.read"
  | "users.edit"
  | "users.suspend"
  | "users.delete"
  | "billing.read"
  | "billing.refund"
  | "entitlement.grant"
  | "entitlement.revoke"
  | "content.read"
  | "content.edit"
  | "content.publish"
  | "moderation.read"
  | "moderation.action"
  | "verification.review"
  | "system.read"
  | "system.configure"
  | "admin.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [],
  SUPPORT: ["users.read", "billing.read", "content.read"],
  MODERATOR: [
    "users.read",
    "content.read",
    "moderation.read",
    "moderation.action",
  ],
  ADMIN: [
    "users.read",
    "users.edit",
    "users.suspend",
    "billing.read",
    "billing.refund",
    "entitlement.grant",
    "entitlement.revoke",
    "content.read",
    "content.edit",
    "content.publish",
    "moderation.read",
    "moderation.action",
    "verification.review",
    "system.read",
  ],
  SUPER_ADMIN: [
    "users.read",
    "users.edit",
    "users.suspend",
    "users.delete",
    "billing.read",
    "billing.refund",
    "entitlement.grant",
    "entitlement.revoke",
    "content.read",
    "content.edit",
    "content.publish",
    "moderation.read",
    "moderation.action",
    "verification.review",
    "system.read",
    "system.configure",
    "admin.manage",
  ],
};

export function roleHasPermission(role: string, permission: Permission): boolean {
  if (!(ROLES as readonly string[]).includes(role)) return false;
  return ROLE_PERMISSIONS[role as Role].includes(permission);
}

export function permissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as Role] ?? [];
}

export function isAtLeast(role: string, minimum: Role): boolean {
  return ROLES.indexOf(role as Role) >= ROLES.indexOf(minimum);
}
