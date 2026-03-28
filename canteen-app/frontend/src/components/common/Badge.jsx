import { ORDER_STATUS } from '../../config/constants';

export default function Badge({ status }) {
  const config = ORDER_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
