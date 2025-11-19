import { useEffect, useState } from 'react';
import { SpecialLink } from '@/types';
import { specialLinksService } from '@/lib/specialLinksService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, ExternalLink, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SpecialLinkWithStudent extends SpecialLink {
  studentId: string;
}

export const SpecialLinksOverview = () => {
  const [links, setLinks] = useState<SpecialLinkWithStudent[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<SpecialLinkWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = specialLinksService.subscribeToAllSpecialLinks(
      (receivedLinks) => {
        setLinks(receivedLinks);
        setLoading(false);
        filterLinks(receivedLinks, searchTerm);
      },
      (error) => {
        console.error('Error loading special links:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filterLinks = (linksToFilter: SpecialLinkWithStudent[], search: string) => {
    if (!search.trim()) {
      setFilteredLinks(linksToFilter);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = linksToFilter.filter(
      (link) =>
        link.courseTitle?.toLowerCase().includes(searchLower) ||
        link.teacherName?.toLowerCase().includes(searchLower) ||
        link.writeUp?.toLowerCase().includes(searchLower)
    );
    setFilteredLinks(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterLinks(links, value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const openLink = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Special Links Overview
        </CardTitle>
        <CardDescription>
          View all special links created by teachers for students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, teacher, or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading special links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <LinkIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No links found' : 'No links yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Teachers will share special links here'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.courseTitle}</TableCell>
                      <TableCell>{link.teacherName}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {link.writeUp}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(link.timestamp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLink(link.link)}
                          className="gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredLinks.length > 0 && (
            <div className="text-sm text-muted-foreground pt-4">
              Showing {filteredLinks.length} of {links.length} special link{links.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
