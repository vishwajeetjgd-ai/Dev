const steps = [
  { key: 'Pending', label: 'Placed', icon: '📝' },
  { key: 'Accepted', label: 'Accepted', icon: '✅' },
  { key: 'Preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'Ready', label: 'Ready', icon: '🎉' },
];

export default function OrderTimeline({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
          <span className="text-xl">❌</span>
          <span className="text-red-600 font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center justify-between py-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {index > 0 && (
              <div
                className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  index <= currentIndex ? 'bg-canteen-500' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Step circle */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                isCurrent
                  ? 'bg-canteen-500 ring-4 ring-canteen-100'
                  : isCompleted
                  ? 'bg-canteen-500'
                  : 'bg-gray-200'
              }`}
            >
              {step.icon}
            </div>

            {/* Label */}
            <span
              className={`text-xs mt-1.5 font-medium ${
                isCompleted ? 'text-canteen-700' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
