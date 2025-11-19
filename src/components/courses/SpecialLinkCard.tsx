import { SpecialLink } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2, Calendar, User, BookOpen } from 'lucide-react';
import { specialLinksService } from '@/lib/specialLinksService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SpecialLinkCardProps {
  link: SpecialLink;
  onDeleted?: () => void;
}

export const SpecialLinkCard = ({ link, onDeleted }: SpecialLinkCardProps) => {
  const { user } = useAuth();
  const formattedDate = new Date(link.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    try {
      if (!user) return;
      await specialLinksService.deleteReceivedLink(user.id, link.id);
      toast.success('Link removed');
      onDeleted?.();
    } catch (error) {
      toast.error('Failed to delete link');
      console.error(error);
    }
  };

  const handleOpenLink = () => {
    try {
      window.open(link.link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Failed to open link');
      console.error(error);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-semibold text-foreground truncate">{link.courseTitle}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.teacherName}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-foreground mb-3 leading-relaxed">{link.writeUp}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <Button
              onClick={handleOpenLink}
              className="gap-2 h-8"
              size="sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
