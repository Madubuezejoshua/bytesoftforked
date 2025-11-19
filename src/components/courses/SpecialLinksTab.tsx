import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SpecialLink } from '@/types';
import { specialLinksService } from '@/lib/specialLinksService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpecialLinkCard } from './SpecialLinkCard';
import { Link as LinkIcon } from 'lucide-react';

export const SpecialLinksTab = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<SpecialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = specialLinksService.subscribeToReceivedLinks(
      user.id,
      (receivedLinks) => {
        setLinks(receivedLinks);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading special links:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLinkDeleted = () => {
    if (!user) return;
    const unsubscribe = specialLinksService.subscribeToReceivedLinks(
      user.id,
      (receivedLinks) => {
        setLinks(receivedLinks);
      },
      (error) => {
        console.error('Error refreshing links:', error);
      }
    );
    return () => unsubscribe();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Special Links
        </CardTitle>
        <CardDescription>
          Resources and links shared by your teachers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading special links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <LinkIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No links yet</h3>
            <p className="text-sm text-muted-foreground">
              Your teachers will share resources and links here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <SpecialLinkCard
                key={link.id}
                link={link}
                onDeleted={handleLinkDeleted}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
