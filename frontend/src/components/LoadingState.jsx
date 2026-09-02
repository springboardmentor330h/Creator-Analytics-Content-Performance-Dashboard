export function LoadingState() {
  return <div className="py-20 text-sm text-center text-gray-400 dark:text-gray-500">Loading...</div>;
}
export function ErrorState({ message }) {
  return <div className="py-20 text-sm text-center text-red-500">{message || "Something went wrong."}</div>;
}
export function EmptyState({ message }) {
  return <div className="py-20 text-sm text-center text-gray-400 dark:text-gray-500">{message || "No data available."}</div>;
}