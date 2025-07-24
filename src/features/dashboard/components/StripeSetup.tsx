interface StripeSetupProps {
  onSetup?: () => void;
}

export function StripeSetup({ onSetup }: StripeSetupProps) {
  const handleSetup = () => {
    // Mock Stripe setup process
    console.log('Đang thiết lập Stripe...');
    onSetup?.();
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      <button
        onClick={handleSetup}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Thiết lập Stripe
      </button>
      <p className="text-xs text-gray-500 max-w-xs text-right">
        Bằng cách nhấp, bạn đồng ý với{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Thỏa thuận Người tạo
        </a>
        {' '}của Figma.
      </p>
    </div>
  );
}
