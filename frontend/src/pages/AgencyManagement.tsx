import { useEffect, useState } from 'react'
import { Building2, CheckCircle2, Mail, ShieldCheck, UserCheck, Users } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface CreatorCard {
  id: number
  full_name: string
  email: string
  role: string
  status: string
  agency_id?: number | null
  bio?: string | null
}

export default function AgencyManagement() {
  const { user } = useAuth()
  const [creators, setCreators] = useState<CreatorCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/agency/creators')
        setCreators(response.data.creators || [])
      } catch {
        setError('Unable to load agency creators. Ensure agency permissions are active.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          <Building2 className="h-3.5 w-3.5" />
          Agency Roster & RBAC Management
        </div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Agency Creator Roster</h2>
        <p className="mt-1 text-sm text-slate-500">
          {user?.role === 'Administrator'
            ? 'Administrators can view all registered creators and manage agency linkages.'
            : 'Monitor creators assigned to your agency and review their analytics access.'}
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span>Loading agency creators...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
      ) : creators.length === 0 ? (
        <div className="ciq-card text-center py-12 text-slate-400 font-medium">No assigned creators found in roster.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creators.map((creator) => (
            <div key={creator.id} className="ciq-card relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                  <UserCheck className="h-3 w-3" />
                  {creator.role}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  {creator.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-lg shadow-sm">
                  {creator.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{creator.full_name}</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-0.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span>{creator.email}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {creator.bio || 'No creator bio provided.'}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-brand-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                  Scoped Workspace Access
                </span>
                <span className="hover:underline cursor-pointer">View Analytics →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
