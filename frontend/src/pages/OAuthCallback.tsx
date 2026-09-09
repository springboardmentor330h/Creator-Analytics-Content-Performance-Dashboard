import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import api from '../services/api'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { platform } = useParams<{ platform: string }>()
  const [searchParams] = useSearchParams()
  const [statusText, setStatusText] = useState('Verifying authorization with provider...')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasExecutedRef = React.useRef(false)

  useEffect(() => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    let isCancelled = false

    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      const platformKey = (platform || 'youtube').toLowerCase().trim()

      if (error) {
        const reason = errorDescription || error || 'Authorization cancelled'
        navigate(`/social-connections?error=${encodeURIComponent(reason)}`, { replace: true })
        return
      }

      if (!code || !state) {
        navigate('/social-connections?error=missing_authorization_code', { replace: true })
        return
      }

      try {
        setStatusText(`Securing ${platformKey.toUpperCase()} connection and exchanging tokens...`)
        
        // Call backend OAuth callback to validate state, exchange code, and associate tokens with user
        await api.get(`/api/social/${platformKey}/callback`, {
          params: { code, state },
          headers: { Accept: 'application/json' },
        })

        if (!isCancelled) {
          setStatusText(`Successfully connected ${platformKey.toUpperCase()}! Returning to Connected Apps...`)
          // Clean navigate to Connected Apps with connected platform flag
          navigate(`/social-connections?connected=${platformKey}`, { replace: true })
        }
      } catch (err: any) {
        if (!isCancelled) {
          // If the backend processed and connected the account (or if strictmode duplicate), verify connection status
          try {
            const statusRes = await api.get(`/api/social/${platformKey}/status`)
            if (statusRes.data && statusRes.data.status === 'connected') {
              navigate(`/social-connections?connected=${platformKey}`, { replace: true })
              return
            }
          } catch {
            // fallback to error display below
          }

          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            `Failed to complete ${platformKey} authorization. Please try again.`
          setErrorMessage(detail)
          setTimeout(() => {
            navigate(`/social-connections?error=${encodeURIComponent(detail)}`, { replace: true })
          }, 2000)
        }
      }
    }

    handleCallback()

    return () => {
      isCancelled = true
    }
  }, [navigate, platform, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200 text-center animate-scale-up">
        {errorMessage ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Authorization Issue</h2>
            <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
            <p className="text-xs text-slate-400">Redirecting to Connected Apps...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Connecting Social Account</h2>
            <p className="text-xs text-slate-500 font-medium">{statusText}</p>
            <div className="flex justify-center pt-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
