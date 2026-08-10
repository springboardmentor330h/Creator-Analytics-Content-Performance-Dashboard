export const ROLES = {
  CREATOR: 'Creator',
  AGENCY: 'Agency',
  MARKETING: 'Marketing Team',
  ADMIN: 'Administrator',
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const PUBLIC_REGISTER_ROLES: AppRole[] = [ROLES.CREATOR, ROLES.AGENCY, ROLES.MARKETING, ROLES.ADMIN]

export function canManageContent(role?: string | null) {
  return role === ROLES.CREATOR || role === ROLES.ADMIN
}

export function canViewAnalytics(role?: string | null) {
  return Boolean(role)
}

export function canManageAgency(role?: string | null) {
  return role === ROLES.AGENCY || role === ROLES.ADMIN
}

export function canCompareContent(role?: string | null) {
  return (
    role === ROLES.CREATOR ||
    role === ROLES.AGENCY ||
    role === ROLES.MARKETING ||
    role === ROLES.ADMIN
  )
}
