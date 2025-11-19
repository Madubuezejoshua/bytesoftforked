import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course } from '@/types';
import { toast } from 'sonner';

interface ScheduleClassFormProps {
  courses: Course[];
  teacherId: string;
  teacherName: string;
  onClassScheduled?: () => void;
}

interface FormErrors {
  courseId?: string;
  topic?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
}

const ScheduleClassForm = ({ courses, teacherId, teacherName, onClassScheduled }: ScheduleClassFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
  });

  const hasApprovedCourses = courses.length > 0;

  useEffect(() => {
    if (open && hasApprovedCourses) {
      const firstInput = document.getElementById('course');
      firstInput?.focus();
    }
  }, [open, hasApprovedCourses]);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Class topic is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.meetingLink.trim()) {
      newErrors.meetingLink = 'Meeting link is required';
    } else if (!isValidUrl(formData.meetingLink)) {
      newErrors.meetingLink = 'Please enter a valid URL (e.g., https://zoom.us/j/...)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const selectedCourse = courses.find(c => c.id === formData.courseId);
      if (!selectedCourse) {
        toast.error('Invalid course selected');
        setLoading(false);
        return;
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (startDateTime >= endDateTime) {
        toast.error('End time must be after start time');
        setLoading(false);
        return;
      }

      if (startDateTime < new Date()) {
        toast.error('Class date and time must be in the future');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'scheduled_classes'), {
        courseId: formData.courseId,
        courseName: selectedCourse.title,
        teacherId,
        teacherName,
        title: formData.topic.trim(),
        description: formData.description.trim(),
        classType: 'online',
        meetingLink: formData.meetingLink.trim(),
        location: null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        maxStudents: 50,
        enrolledStudents: [],
        createdAt: new Date().toISOString(),
        status: 'scheduled',
      });

      toast.success('Class scheduled successfully!');
      setOpen(false);
      setFormData({
        courseId: '',
        topic: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
      });
      setErrors({});
      onClassScheduled?.();
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error('Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  if (!hasApprovedCourses) {
    return (
      <Button size="sm" className="gap-2" disabled title="No approved courses available for scheduling">
        <Plus className="w-4 h-4" />
        Schedule Class
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Class</DialogTitle>
          <DialogDescription>Create a new class with meeting link details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger id="course" className={errors.courseId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseId && (
              <p className="text-sm text-red-500">{errors.courseId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Class Topic *</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Introduction to React Hooks"
              className={errors.topic ? 'border-red-500' : ''}
            />
            {errors.topic && (
              <p className="text-sm text-red-500">{errors.topic}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will be covered in this class..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Zoom or Meeting Link *</Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className={errors.meetingLink ? 'border-red-500' : ''}
            />
            {errors.meetingLink && (
              <p className="text-sm text-red-500">{errors.meetingLink}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Scheduling...' : 'Schedule Class'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleClassForm;
