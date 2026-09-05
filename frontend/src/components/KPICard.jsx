export default function KPICard({ label, value, suffix = "" }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-gray-500 capitalize">{label}</p>
      <p className="text-2xl font-bold">
        {value ?? "—"}
        {value !== undefined && value !== null ? suffix : ""}
      </p>
    </div>
  );
}