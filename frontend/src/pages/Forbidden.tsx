import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />

      <div className="ciq-card max-w-lg text-center bg-white/5 border border-white/10 backdrop-blur-xl p-8 relative z-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-400">Error 403 · Access Forbidden</span>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Permission Restricted</h1>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          Your current user role does not possess the RBAC scope permissions required to access this endpoint or view this page.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard" className="ciq-btn-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
