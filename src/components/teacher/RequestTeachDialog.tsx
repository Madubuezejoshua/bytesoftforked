import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Course } from '@/types';
import { courseRequestService } from '@/lib/courseRequestService';
import { toast } from 'sonner';

interface RequestTeachDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  teacherId: string;
  teacherName: string;
  onSuccess: () => void;
}

const RequestTeachDialog = ({
  isOpen,
  onClose,
  course,
  teacherId,
  teacherName,
  onSuccess,
}: RequestTeachDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await courseRequestService.createCourseRequest(
        course.id,
        teacherId,
        teacherName,
        course.title
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating course request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request to Teach Course</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div>
              <p className="font-semibold text-foreground mb-2">{course.title}</p>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p><span className="font-medium">Category:</span> {course.category}</p>
              <p><span className="font-medium">Level:</span> {course.level}</p>
              <p><span className="font-medium">Duration:</span> {course.duration}</p>
              <p><span className="font-medium">Price:</span> ₦{course.price.toLocaleString()}</p>
            </div>
            <p className="text-sm">
              By confirming, you will submit a request to teach this course.
              The coordinator will review and approve or reject your request.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end pt-4">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Request'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RequestTeachDialog;
