import { CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerifiedBadge = ({
  isVerified = false,
  size = 'md',
  showLabel = false
}: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badge = (
    <div className="inline-flex items-center gap-1">
      <CheckCircle2 className={`${sizeClasses[size]} text-green-600 dark:text-green-500 fill-current`} />
      {showLabel && <span className="text-xs font-medium text-green-600 dark:text-green-500">Verified</span>}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified user</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
