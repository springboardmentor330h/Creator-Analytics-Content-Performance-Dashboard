/**
 * PlatformIcon — returns the official brand icon for a social platform.
 *
 * Usage:
 *   <PlatformIcon platform="YouTube" size={16} />
 *   <PlatformIcon platform={item.platform} />
 *
 * Supports: YouTube, Instagram, Facebook, TikTok, Twitter, X, LinkedIn,
 *           Twitch, Snapchat, Pinterest.
 * Falls back to a Globe icon for any unknown platform.
 *
 * Design contract:
 * - Icons are square, sized via the `size` prop (default 18).
 * - Each icon is wrapped in a rounded container with the platform's brand
 *   background color so it reads clearly at any size.
 * - The `title` attribute on the SVG acts as a tooltip.
 * - `aria-label` is set for accessibility.
 */

import { Globe } from 'lucide-react'

interface PlatformIconProps {
  platform: string
  /** Icon box size in pixels (default 18) */
  size?: number
  /** Extra class names applied to the outer wrapper */
  className?: string
}

/** Maps lower-cased platform name → brand hex colour */
const BRAND_BG: Record<string, string> = {
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2',
  tiktok: '#010101',
  twitter: '#1da1f2',
  x: '#000000',
  linkedin: '#0a66c2',
  twitch: '#9146ff',
  snapchat: '#fffc00',
  pinterest: '#e60023',
}

/** Snapchat has a dark logo on yellow; all others use white */
const ICON_COLOR: Record<string, string> = {
  snapchat: '#000000',
}

function getIconFill(key: string) {
  return ICON_COLOR[key] || '#ffffff'
}

/** Individual SVG icon paths – official mono brand marks */
function YoutubeIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M23.5 6.19a3.02 3.02 0 0 0-2.13-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.37.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.13 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.37-.55a3.02 3.02 0 0 0 2.13-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81z"
        fill={fill}
      />
      <path d="M9.75 15.5l6.25-3.5-6.25-3.5v7z" fill="#ff0000" />
    </svg>
  )
}

function InstagramIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
        fill={fill}
      />
    </svg>
  )
}

function FacebookIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill={fill}
      />
    </svg>
  )
}

function TikTokIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.94a8.27 8.27 0 0 0 4.84 1.56V7.05a4.85 4.85 0 0 1-1.07-.36z"
        fill={fill}
      />
    </svg>
  )
}

function TwitterIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"
        fill={fill}
      />
    </svg>
  )
}

function XIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
        fill={fill}
      />
    </svg>
  )
}

function LinkedInIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill={fill}
      />
    </svg>
  )
}

function TwitchIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"
        fill={fill}
      />
    </svg>
  )
}

function SnapchatIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.49-.104.19 0 .338.042.49.104.308.14.54.34.54.54 0 .3-.165.42-.487.57-.09.03-.195.075-.315.12-.24.09-.54.195-.7.36-.195.18-.405.675-.315.93.06.18.195.3.39.3.39 0 .975-.45 1.395-.45.315 0 .525.165.525.42 0 .12-.06.255-.165.375-.3.375-.975.57-1.5.57-.198 0-.33-.03-.45-.045-.225-.045-.42-.09-.615.15-.165.15-.525.495-.645.54-.375.195-.81.24-1.245.315-.27.06-.54.12-.78.255-.54.285-.9 1.125-.9 1.2 0 .15-.135.3-.33.3-.06 0-.12-.015-.18-.03-.45-.105-1.185-.375-2.505-.435-.075 0-.135 0-.21.015-.39.3-.345.39-.12.45.06.015.12.03.18.03.225.045.405.15.405.33 0 .36-1.23.645-1.95.78a18.3 18.3 0 0 1-.225.045 9.3 9.3 0 0 0-.24.06 4.26 4.26 0 0 0 0 .42c.09.195.285.36.45.525.42.39.93.87.93 1.575 0 .795-.705 1.38-1.665 1.38-.435 0-.855-.135-1.26-.27-.375-.12-.735-.24-1.08-.24s-.705.12-1.08.24c-.405.135-.825.27-1.26.27-.96 0-1.665-.585-1.665-1.38 0-.705.51-1.185.93-1.575.165-.165.36-.33.45-.525.06-.135.045-.27 0-.42a9.3 9.3 0 0 0-.24-.06 18.3 18.3 0 0 1-.225-.045c-.72-.135-1.95-.42-1.95-.78 0-.18.18-.285.405-.33.06 0 .12-.015.18-.03.225-.06.27-.15-.12-.45-.075-.015-.135-.015-.21-.015-1.32.06-2.055.33-2.505.435-.06.015-.12.03-.18.03-.195 0-.33-.15-.33-.3 0-.075-.36-.915-.9-1.2-.24-.135-.51-.195-.78-.255-.435-.075-.87-.12-1.245-.315-.12-.045-.48-.39-.645-.54-.195-.24-.39-.195-.615-.15-.12.015-.252.045-.45.045-.525 0-1.2-.195-1.5-.57-.105-.12-.165-.255-.165-.375 0-.255.21-.42.525-.42.42 0 1.005.45 1.395.45.195 0 .33-.12.39-.3.09-.255-.12-.75-.315-.93-.16-.165-.46-.27-.7-.36-.12-.045-.225-.09-.315-.12-.322-.15-.487-.27-.487-.57 0-.2.232-.4.54-.54.152-.062.3-.104.49-.104.146 0 .325.016.49.104.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z"
        fill={fill}
      />
    </svg>
  )
}

function PinterestIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"
        fill={fill}
      />
    </svg>
  )
}

export default function PlatformIcon({ platform, size = 18, className = '' }: PlatformIconProps) {
  const key = (platform || '').toLowerCase().trim()
  const bg = BRAND_BG[key]
  const iconFill = getIconFill(key)
  const pad = Math.round(size * 0.18)

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.25),
    backgroundColor: bg || '#94a3b8',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: pad,
    boxSizing: 'border-box',
  }

  let icon: React.ReactNode

  switch (key) {
    case 'youtube':
      // YouTube has a white play button — render background as white, icon red inside
      icon = <YoutubeIcon fill="#ffffff" />
      break
    case 'instagram':
      icon = <InstagramIcon fill={iconFill} />
      break
    case 'facebook':
      icon = <FacebookIcon fill={iconFill} />
      break
    case 'tiktok':
      icon = <TikTokIcon fill={iconFill} />
      break
    case 'twitter':
      icon = <TwitterIcon fill={iconFill} />
      break
    case 'x':
      icon = <XIcon fill={iconFill} />
      break
    case 'linkedin':
      icon = <LinkedInIcon fill={iconFill} />
      break
    case 'twitch':
      icon = <TwitchIcon fill={iconFill} />
      break
    case 'snapchat':
      icon = <SnapchatIcon fill={iconFill} />
      break
    case 'pinterest':
      icon = <PinterestIcon fill={iconFill} />
      break
    default:
      // Fallback: Globe icon from lucide-react
      return (
        <span
          className={className}
          style={{ ...containerStyle, backgroundColor: '#94a3b8' }}
          title={platform || 'Unknown'}
          aria-label={platform || 'Unknown platform'}
        >
          <Globe style={{ width: size - pad * 2, height: size - pad * 2, color: '#ffffff' }} />
        </span>
      )
  }

  return (
    <span
      className={className}
      style={containerStyle}
      title={platform}
      aria-label={`${platform} icon`}
    >
      {icon}
    </span>
  )
}
