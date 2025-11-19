import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { coordinatorReviewService } from '@/lib/coordinatorReviewService';

interface CoordinatorReviewFormProps {
  teacherId: string;
  courseId: string;
  coordinatorId: string;
  coordinatorName: string;
  onReviewSubmitted: () => void;
}

const CoordinatorReviewForm = ({
  teacherId,
  courseId,
  coordinatorId,
  coordinatorName,
  onReviewSubmitted,
}: CoordinatorReviewFormProps) => {
  const [rating, setRating] = useState<string>('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      toast.error('Please provide a rating and comment');
      return;
    }

    setLoading(true);
    try {
      await coordinatorReviewService.createReview(
        teacherId,
        courseId,
        coordinatorId,
        coordinatorName,
        parseInt(rating),
        comment.trim()
      );

      toast.success('Review submitted successfully');
      setRating('5');
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              i <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground hover:text-amber-400'
            }`}
            onClick={() => setRating(String(i))}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Leave a Review</CardTitle>
        <CardDescription>Share your feedback about this teacher's performance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="rating" className="text-sm font-medium">
              Rating
            </Label>
            <div className="flex items-center gap-4">
              {renderStars(parseInt(rating))}
              <span className="text-sm text-muted-foreground font-medium">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your feedback about the teacher's performance, teaching methods, student engagement, etc."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CoordinatorReviewForm;
