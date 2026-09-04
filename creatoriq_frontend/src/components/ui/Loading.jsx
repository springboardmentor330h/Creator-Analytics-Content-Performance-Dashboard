export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
      <div className="h-10 w-10 border-[3px] border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
