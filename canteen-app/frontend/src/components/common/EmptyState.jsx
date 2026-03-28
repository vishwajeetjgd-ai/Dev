export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {message && <p className="text-gray-500 mt-1 text-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
