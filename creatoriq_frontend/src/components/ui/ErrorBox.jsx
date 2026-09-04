export default function ErrorBox({ message }) {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm flex gap-2">
      <span className="font-semibold shrink-0">Error</span>
      <span>{message || 'Something went wrong. Please try again.'}</span>
    </div>
  )
}
