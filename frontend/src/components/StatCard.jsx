function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
        </div>

        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

export default StatCard;
