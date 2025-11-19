import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Course, Enrollment } from '@/types';
import { specialLinksService } from '@/lib/specialLinksService';
import { toast } from 'sonner';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SendLinksDialogProps {
  courses: Course[];
  enrollments: Enrollment[];
  teacherId: string;
  teacherName: string;
  onLinksSent?: () => void;
}

export const SendLinksDialog = ({
  courses,
  enrollments,
  teacherId,
  teacherName,
  onLinksSent,
}: SendLinksDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [writeUp, setWriteUp] = useState('');
  const [link, setLink] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const courseEnrollments = selectedCourse
    ? enrollments.filter((e) => e.courseId === selectedCourse)
    : [];

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === courseEnrollments.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(courseEnrollments.map((e) => e.studentId)));
    }
  };

  const handleSendLinks = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (!writeUp.trim()) {
      toast.error('Please enter a write-up');
      return;
    }

    if (!link.trim()) {
      toast.error('Please enter a link');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsLoading(true);
    try {
      const studentIds = Array.from(selectedStudents);
      await specialLinksService.sendLinkToMultipleStudents(
        studentIds,
        teacherId,
        teacherName,
        selectedCourse,
        selectedCourseData?.title || '',
        writeUp,
        link
      );

      toast.success(`Link sent to ${studentIds.length} student(s)`);
      setWriteUp('');
      setLink('');
      setSelectedCourse('');
      setSelectedStudents(new Set());
      setOpen(false);
      onLinksSent?.();
    } catch (error) {
      console.error('Error sending links:', error);
      toast.error('Failed to send links');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <LinkIcon className="w-4 h-4" />
          Send Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Special Link</DialogTitle>
          <DialogDescription>
            Send a resource link to your students with a description
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="course-select">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="writeup">Description/Write-up</Label>
            <Textarea
              id="writeup"
              placeholder="Add a description of this resource..."
              value={writeUp}
              onChange={(e) => setWriteUp(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link URL</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/resource"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {selectedCourse && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Students</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllStudents}
                >
                  {selectedStudents.size === courseEnrollments.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              {courseEnrollments.length === 0 ? (
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No students enrolled in this course yet
                  </p>
                </Card>
              ) : (
                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-3 pr-4">
                    {courseEnrollments.map((enrollment) => (
                      <div key={enrollment.studentId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${enrollment.studentId}`}
                          checked={selectedStudents.has(enrollment.studentId)}
                          onCheckedChange={() => toggleStudent(enrollment.studentId)}
                        />
                        <Label
                          htmlFor={`student-${enrollment.studentId}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <div className="flex flex-col">
                            <span>{enrollment.studentName}</span>
                            <span className="text-xs text-muted-foreground">
                              {enrollment.studentEmail}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {selectedStudents.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedStudents.size} student(s) selected
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendLinks} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Link'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
