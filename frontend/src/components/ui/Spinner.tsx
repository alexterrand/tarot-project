// Spinner component for loading states

export function Spinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeStyles = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeStyles[size]} border-tarot-green border-t-transparent rounded-full animate-spin`}
    />
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <Spinner size="large" />
        {message && <p className="text-gray-700 font-medium">{message}</p>}
      </div>
    </div>
  );
}
