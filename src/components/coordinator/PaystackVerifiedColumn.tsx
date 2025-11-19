import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { verificationService, VerifiedStudent } from '@/lib/verificationService';
import { Search, CheckCircle, Unsubscribe } from 'lucide-react';
import { toast } from 'sonner';

const PaystackVerifiedColumn = () => {
  const [students, setStudents] = useState<VerifiedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<VerifiedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);

    const unsubscribe = verificationService.subscribeToPaystackVerifiedStudents(
      (data) => {
        setStudents(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error in Paystack students listener:', error);
        toast.error('Failed to load verified students');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Paystack Verified
        </CardTitle>
        <CardDescription>
          Students verified through Paystack payment ({filteredStudents.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading verified students...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              {students.length === 0 ? 'No Paystack-verified students yet' : 'No results found'}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Purchased Courses</TableHead>
                  <TableHead>Verified Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.userId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {student.purchasedCourses.length > 0 ? (
                          <>
                            <Badge variant="secondary">{student.purchasedCourses.length} course{student.purchasedCourses.length !== 1 ? 's' : ''}</Badge>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(student.verifiedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaystackVerifiedColumn;
