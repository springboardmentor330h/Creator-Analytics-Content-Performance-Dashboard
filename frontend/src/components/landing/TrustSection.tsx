export default function TrustSection() {
  const platforms = [
    {
      name: 'YouTube',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
          <polygon fill="#FFFFFF" points="9.545,15.568 15.818,12 9.545,8.432" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#ffd600" />
              <stop offset="20%" stopColor="#ff7a00" />
              <stop offset="40%" stopColor="#ff0069" />
              <stop offset="70%" stopColor="#d300c5" />
              <stop offset="100%" stopColor="#7638fa" />
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="5.5" fill="url(#ig-grad)" />
          <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="18" cy="6" r="1.2" fill="#fff" />
        </svg>
      )
    },
    {
      name: 'TikTok',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <rect width="24" height="24" rx="5" fill="#010101" />
          <path fill="#69C9D0" d="M13.5 4.5h2.1a3.9 3.9 0 0 0 3.4 3.4v2.1a5.9 5.9 0 0 1-3.4-1v5.25a4.75 4.75 0 1 1-4.75-4.75h.65v2.1a2.65 2.65 0 1 0 2 2.65V4.5z" opacity="0.8" />
          <path fill="#EE1D52" d="M13.8 4.5h1.8a3.9 3.9 0 0 0 3.4 3.4V9.9a5.9 5.9 0 0 1-3.4-1v5.35a4.75 4.75 0 1 1-4.75-4.75h.65v2.1a2.65 2.65 0 1 0 2 2.65V4.5z" opacity="0.6" />
          <path fill="#fff" d="M13.5 4.5h2.1a3.9 3.9 0 0 0 3.4 3.4v2.1a5.9 5.9 0 0 1-3.4-1v5.25a4.75 4.75 0 1 1-4.75-4.75h.65v2.1a2.65 2.65 0 1 0 2 2.65V4.5z" />
        </svg>
      )
    },
    {
      name: 'Meta',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#0081FB" d="M2 12.24C2 8.39 4.04 5 7.3 5c1.7 0 2.88.6 4.47 2.76L13 9.5l1.23-1.74C15.82 5.6 17 5 18.7 5 21.96 5 24 8.39 24 12.24c0 2.31-.54 3.9-1.52 5.07C21.52 18.53 20.3 19 18.96 19c-1.27 0-2.2-.35-3.49-1.62l-1.83-1.83-.66.93c-1.3 1.86-2.3 2.52-3.96 2.52-1.4 0-2.65-.49-3.57-1.72C4.53 16.06 2 15.5 2 12.24zm6.7 3.96c.82 0 1.43-.37 2.47-1.85l.67-.94-1.6-1.73c-.86-.92-1.37-1.2-2.12-1.2-1.43 0-2.35 1.28-2.35 3.14 0 1.55.73 2.58 1.93 2.58zm10.26 0c1.17 0 1.87-1 1.87-2.58 0-1.86-.93-3.14-2.35-3.14-.75 0-1.26.28-2.1 1.18l-1.52 1.64.7.97c1.04 1.46 1.58 1.93 2.4 1.93z" />
        </svg>
      )
    },
    {
      name: 'Google',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )
    },
    {
      name: 'Amazon',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#FF9900" d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 0 1-.75.074c-1.053-.875-1.24-1.282-1.818-2.114-1.737 1.772-2.967 2.303-5.22 2.303-2.667 0-4.741-1.646-4.741-4.94 0-2.572 1.394-4.323 3.382-5.181 1.722-.756 4.126-.891 5.965-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.818-1.775-.818-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.33c-.259-.056-.548-.266-.472-.661.703-3.7 4.048-4.814 7.044-4.814 1.532 0 3.532.408 4.737 1.57 1.532 1.433 1.386 3.344 1.386 5.424v4.913c0 1.477.614 2.127 1.192 2.926.202.284.247.624-.01.835l-2.386 2.137z" />
          <path fill="#FF9900" d="M20.945 20.395c-2.208 1.631-5.41 2.5-8.165 2.5-3.863 0-7.341-1.429-9.973-3.804-.207-.187-.022-.442.226-.297 2.84 1.651 6.354 2.644 9.981 2.644 2.447 0 5.137-.507 7.611-1.558.374-.157.688.245.32.515z" />
          <path fill="#FF9900" d="M21.921 19.276c-.282-.362-1.87-.171-2.583-.086-.217.026-.25-.163-.055-.3 1.265-.888 3.341-.632 3.583-.334.242.3-.063 2.373-1.251 3.362-.182.152-.356.071-.275-.131.267-.665.864-2.149.581-2.511z" />
        </svg>
      )
    },
    {
      name: 'Spotify',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="12" fill="#1DB954" />
          <path fill="#fff" d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z" />
        </svg>
      )
    },
    {
      name: 'Microsoft',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
          <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
          <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
          <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
        </svg>
      )
    },
  ]

  const doubledPlatforms = [...platforms, ...platforms]

  return (
    <section className="border-y border-slate-200/70 bg-slate-50/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
          Trusted by creators and teams analyzing multi-platform data from
        </p>

        <div className="mt-8">
          {/* Marquee Container (Hidden on reduced motion) */}
          <div 
            className="relative overflow-hidden flex motion-reduce:hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div className="flex w-max animate-marquee-horizontal hover:[animation-play-state:paused]">
              {doubledPlatforms.map((platform, index) => (
                <div
                  key={`${platform.name}-${index}`}
                  className="flex items-center gap-3 px-6 sm:px-8 md:px-12 py-3 text-slate-500 font-extrabold text-sm hover:text-slate-900 transition-colors group cursor-default"
                >
                  <div className="flex-shrink-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300">
                    {platform.icon}
                  </div>
                  <span className="tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors whitespace-nowrap">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Static Grid Fallback (Visible only on reduced motion) */}
          <div className="hidden motion-reduce:grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8 items-center justify-items-center opacity-75">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center gap-2 p-3 text-slate-500 font-extrabold text-sm hover:text-slate-900 transition-colors group cursor-default"
              >
                <div className="flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300">
                  {platform.icon}
                </div>
                <span className="tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors text-xs">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
