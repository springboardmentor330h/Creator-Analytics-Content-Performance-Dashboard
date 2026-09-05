/**
 * Wraps page content and shows a loading spinner, an error message, or
 * the children, depending on state. Every page uses this the same way
 * so loading/error/empty handling stays consistent across the app.
 */
export default function PageState({ loading, error, children }) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Something went wrong: {error}</p>
      </div>
    );
  }

  return children;
}