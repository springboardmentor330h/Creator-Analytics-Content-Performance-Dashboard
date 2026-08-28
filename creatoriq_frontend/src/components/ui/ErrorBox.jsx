export default function ErrorBox({ message }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-sm">
      {message || 'Something went wrong. Please try again.'}
    </div>
  )
}
