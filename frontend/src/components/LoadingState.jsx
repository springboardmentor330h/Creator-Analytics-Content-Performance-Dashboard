export function LoadingState() {
  return <div className="text-gray-500 py-10 text-center">Loading...</div>;
}

export function ErrorState({ message }) {
  return (
    <div className="text-red-500 py-10 text-center">
      {message || "Something went wrong."}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="text-gray-400 py-10 text-center">
      {message || "No data available."}
    </div>
  );
}