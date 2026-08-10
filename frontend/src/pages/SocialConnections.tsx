import { useAuth } from '../context/AuthContext'
import SocialIntegrationManager from '../components/SocialIntegrationManager'

export default function SocialConnections() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="text-sm font-bold text-brand-600">
          Welcome, {user?.full_name || 'Creator'}
        </div>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Social Media Connections
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Connect your social media accounts to track and analyze performance.
        </p>
      </div>

      <SocialIntegrationManager />
    </div>
  )
}
