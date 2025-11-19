import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verificationService } from '@/lib/verificationService';
import { User, Course } from '@/types';
import { Search, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ManualVerificationFormProps {
  onVerificationSuccess?: () => void;
}

const ManualVerificationForm = ({ onVerificationSuccess }: ManualVerificationFormProps) => {
  const [email, setEmail] = useState('');
  const [student, setStudent] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await verificationService.getAllCourses();
      setCourses(data.filter((course) => course.isActive));
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSearchStudent = async () => {
    if (!email.trim()) {
      setError('Please enter a student email');
      return;
    }

    setError(null);
    setLoadingStudent(true);

    try {
      const foundStudent = await verificationService.findStudentByEmail(email);

      if (!foundStudent) {
        setError('Student not found. Please verify the email address.');
        setStudent(null);
      } else {
        setStudent(foundStudent);
        setSelectedCourses([]);
        setError(null);
        toast.success(`Found student: ${foundStudent.name}`);
      }
    } catch (err) {
      console.error('Error searching student:', err);
      setError('Failed to search for student');
    } finally {
      setLoadingStudent(false);
    }
  };

  const addCourse = () => {
    if (!selectedCourseId) {
      setError('Please select a course');
      return;
    }

    if (selectedCourses.includes(selectedCourseId)) {
      setError('This course is already selected');
      return;
    }

    setSelectedCourses([...selectedCourses, selectedCourseId]);
    setSelectedCourseId('');
    setError(null);
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
  };

  const handleSubmit = async () => {
    if (!student) {
      setError('Please find a student first');
      return;
    }

    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    if (student.verificationType === 'paystack') {
      setError('This student is already verified through Paystack and cannot be modified');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await verificationService.manuallyVerifyStudent(
        student.id,
        selectedCourses
      );

      if (result.success) {
        toast.success(`Successfully verified ${student.name}!`);
        setEmail('');
        setStudent(null);
        setSelectedCourses([]);
        setSelectedCourseId('');
        onVerificationSuccess?.();
      } else {
        setError(result.error || 'Failed to verify student');
        toast.error(result.error || 'Verification failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCourseNames = () => {
    return selectedCourses
      .map((id) => courses.find((c) => c.id === id)?.title)
      .filter(Boolean);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Manual Verification
        </CardTitle>
        <CardDescription>
          Manually verify students and add course access
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-base font-semibold">
              Student Email
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="email"
                placeholder="Enter student email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                disabled={loadingStudent}
                className="flex-1"
              />
              <Button
                onClick={handleSearchStudent}
                disabled={loadingStudent || !email.trim()}
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {student && (
            <div className="space-y-3">
              {student.verificationType === 'paystack' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This student is already verified through Paystack payment and cannot be modified. Their verification status is protected.
                  </AlertDescription>
                </Alert>
              )}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Student Found</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Verification Status</p>
                    <p className="font-medium">
                      {student.verificationType === 'paystack' ? 'Paystack Verified' : student.isVerified ? 'Manually Verified' : 'Not Verified'}
                    </p>
                  </div>
                  {student.purchasedCourses && student.purchasedCourses.length > 0 && (
                    <div>
                      <p className="text-muted-foreground">Courses</p>
                      <p className="font-medium">{student.purchasedCourses.length}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {student && student.verificationType !== 'paystack' && (
            <div>
              <Label htmlFor="course-select" className="text-base font-semibold">
                Select Courses
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add courses to the student&apos;s purchased courses
              </p>
              <div className="flex gap-2 mt-2">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={loadingCourses}>
                  <SelectTrigger id="course-select" className="flex-1">
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - ₦{course.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addCourse}
                  disabled={!selectedCourseId || loadingCourses}
                  variant="outline"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {selectedCourses.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Selected Courses</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getSelectedCourseNames().map((courseName, index) => (
                  <Badge key={selectedCourses[index]} variant="secondary" className="flex items-center gap-2 pr-1">
                    {courseName}
                    <button
                      onClick={() => removeCourse(selectedCourses[index])}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !student || selectedCourses.length === 0 || student?.verificationType === 'paystack'}
            className="flex-1"
          >
            {submitting ? 'Verifying...' : 'Verify Student'}
          </Button>
          {student && (
            <Button
              onClick={() => {
                setStudent(null);
                setEmail('');
                setSelectedCourses([]);
                setError(null);
              }}
              variant="outline"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualVerificationForm;
