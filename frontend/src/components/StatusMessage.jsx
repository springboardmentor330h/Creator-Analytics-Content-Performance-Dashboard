export function LoadingState({ label = "Loading..." }) {
  return <p className="text-sm text-slate-400 py-8 text-center">{label}</p>;
}

export function ErrorState({ message = "Something went wrong." }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  );
}

export function EmptyState({ message = "No data yet." }) {
  return <p className="text-sm text-slate-400 py-8 text-center">{message}</p>;
}
