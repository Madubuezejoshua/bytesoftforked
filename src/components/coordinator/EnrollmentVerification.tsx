import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Enrollment } from '@/types';
import { Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const EnrollmentVerification = () => {
  const [searchCode, setSearchCode] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'enrollments'), where('enrollmentCode', '==', searchCode.toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const enrollmentData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Enrollment;
        setEnrollment(enrollmentData);
      } else {
        toast.error('Enrollment code not found');
        setEnrollment(null);
      }
    } catch (error) {
      console.error('Error searching enrollment:', error);
      toast.error('Failed to search enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Enrollment Code</CardTitle>
        <CardDescription>Search for a student by their enrollment code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter enrollment code (e.g., SS-ABC123)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {enrollment && (
          <div className="bg-muted p-6 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-primary mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Enrollment Found</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Student Name</p>
                <p className="font-semibold">{enrollment.studentName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">{enrollment.studentEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Course</p>
                <p className="font-semibold">{enrollment.courseName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount Paid</p>
                <p className="font-semibold">₦{enrollment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Enrollment Code</p>
                <p className="font-semibold text-primary">{enrollment.enrollmentCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-green-600">{enrollment.paymentStatus}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentVerification;
