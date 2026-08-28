import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-sm">
        <div>
          <p className="text-slate-400">Name</p>
          <p className="font-medium">{user?.full_name || '—'}</p>
        </div>
        <div>
          <p className="text-slate-400">Email</p>
          <p className="font-medium">{user?.email || '—'}</p>
        </div>
        <div>
          <p className="text-slate-400">Role</p>
          <p className="font-medium capitalize">{user?.role || '—'}</p>
        </div>
      </div>
    </div>
  )
}
