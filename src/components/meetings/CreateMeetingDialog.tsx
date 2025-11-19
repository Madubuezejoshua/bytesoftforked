import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MeetingService } from '@/lib/meetingService';
import { LiveKitService } from '@/lib/liveKitService';
import { toast } from 'sonner';

interface CreateMeetingDialogProps {
  onMeetingCreated: () => void;
}

const CreateMeetingDialog = ({ onMeetingCreated }: CreateMeetingDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    scheduledTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        toast.error('Please log in to create a meeting');
        setLoading(false);
        return;
      }

      if (user.role !== 'teacher' && user.role !== 'admin') {
        toast.error(`Only teachers and admins can create meetings. Your role is: ${user.role}`);
        setLoading(false);
        return;
      }

      if (!formData.title.trim()) {
        toast.error('Meeting title is required');
        setLoading(false);
        return;
      }

      if (!formData.scheduledTime) {
        toast.error('Scheduled time is required');
        setLoading(false);
        return;
      }

      const scheduledDateTime = new Date(formData.scheduledTime);
      if (isNaN(scheduledDateTime.getTime())) {
        toast.error('Invalid scheduled time format');
        setLoading(false);
        return;
      }

      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        setLoading(false);
        return;
      }

      const roomName = LiveKitService.generateRoomName('meeting');

      if (!LiveKitService.validateRoomName(roomName)) {
        toast.error('Invalid room name generated. Please try again.');
        setLoading(false);
        return;
      }

      await MeetingService.createMeeting({
        title: formData.title.trim(),
        roomName,
        scheduledTime: scheduledDateTime.toISOString(),
        teacherId: user.id,
        teacherName: user.name || 'Unknown Teacher',
        participants: [],
        status: 'scheduled',
        meetingHost: user.id,
      });

      setFormData({ title: '', scheduledTime: '' });
      setOpen(false);

      toast.success('Meeting created successfully!');
      onMeetingCreated();
    } catch (error: any) {
      console.error('Error creating meeting:', error);

      let userMessage = 'Failed to create meeting. Please try again.';

      if (error?.code === 'permission-denied') {
        userMessage = `Permission denied. Your role: ${user?.role}. Please ensure you are logged in as a teacher and try again.`;
      } else if (error?.code === 'unauthenticated') {
        userMessage = 'Your session has expired. Please log in again.';
      } else if (error?.message?.includes('unavailable')) {
        userMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error?.message) {
        userMessage = `Meeting creation failed: ${error.message}`;
      }

      toast.error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>Schedule a new online meeting</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Math Class - Chapter 5"
              required
            />
          </div>
          <div>
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              id="scheduledTime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
