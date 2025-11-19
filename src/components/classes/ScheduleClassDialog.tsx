import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course } from '@/types';
import { toast } from 'sonner';

interface ScheduleClassDialogProps {
  course: Course;
  teacherId: string;
  teacherName: string;
  onClassScheduled?: () => void;
}

const ScheduleClassDialog = ({ course, teacherId, teacherName, onClassScheduled }: ScheduleClassDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classType: 'online' as 'online' | 'physical',
    meetingLink: '',
    location: '',
    startDate: '',
    startTime: '',
    endTime: '',
    maxStudents: '50',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

      await addDoc(collection(db, 'scheduled_classes'), {
        courseId: course.id,
        courseName: course.title,
        teacherId,
        teacherName,
        title: formData.title,
        description: formData.description,
        classType: formData.classType,
        meetingLink: formData.classType === 'online' ? formData.meetingLink : null,
        location: formData.classType === 'physical' ? formData.location : null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        maxStudents: parseInt(formData.maxStudents),
        enrolledStudents: [],
        createdAt: new Date().toISOString(),
        status: 'scheduled',
      });

      toast.success('Class scheduled successfully!');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        classType: 'online',
        meetingLink: '',
        location: '',
        startDate: '',
        startTime: '',
        endTime: '',
        maxStudents: '50',
      });
      onClassScheduled?.();
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error('Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <CalendarIcon className="w-4 h-4" />
          Schedule Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Class</DialogTitle>
          <DialogDescription>
            Schedule a class for {course.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will be covered in this class..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classType">Class Type *</Label>
            <Select
              value={formData.classType}
              onValueChange={(value: any) => setFormData({ ...formData, classType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.classType === 'online' ? (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link *</Label>
              <Input
                id="meetingLink"
                type="url"
                required
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 301, Main Building"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">Maximum Students *</Label>
            <Input
              id="maxStudents"
              type="number"
              required
              min="1"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Scheduling...' : 'Schedule Class'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleClassDialog;
