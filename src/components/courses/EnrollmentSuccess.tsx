import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollmentSuccessProps {
  enrollmentCode: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EnrollmentSuccess = ({ enrollmentCode, isOpen, onClose }: EnrollmentSuccessProps) => {
  const copyToClipboard = () => {
    if (enrollmentCode) {
      navigator.clipboard.writeText(enrollmentCode);
      toast.success('Enrollment code copied!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Enrollment Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your payment has been processed and you're now enrolled in the course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Enrollment Code</p>
            <p className="text-3xl font-bold text-primary mb-4">{enrollmentCode}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Important:</strong> Save this code! You can use it to verify your enrollment with the coordinator.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Go to My Courses
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentSuccess;
