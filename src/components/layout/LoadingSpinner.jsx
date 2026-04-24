import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );
}
