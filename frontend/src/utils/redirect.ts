/**
 * Validates and sanitizes a post-login redirect path.
 *
 * Prevents open redirect attacks (rejects absolute URLs, protocol-relative '//',
 * and malformed paths) and ensures that landing page ('/') is never used as the
 * default post-login destination.
 */
export function getSafeRedirectUrl(target: unknown, fallback: string = '/dashboard'): string {
  if (typeof target !== 'string') {
    return fallback
  }

  const trimmed = target.trim()

  // Empty, landing page root, or login page itself should redirect to fallback (dashboard)
  if (!trimmed || trimmed === '/' || trimmed.startsWith('/login')) {
    return fallback
  }

  // Must begin with a single '/' and not '//' or '/\' (protocol-relative/malformed)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback
  }

  // Reject anything with a protocol scheme like http:, https:, javascript:, data:
  if (trimmed.includes('://') || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return fallback
  }

  return trimmed
}
