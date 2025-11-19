import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageCircle } from 'lucide-react';
import { TeacherReview } from '@/types';
import { coordinatorReviewService } from '@/lib/coordinatorReviewService';

interface TeacherReviewsDisplayProps {
  teacherId: string;
  teacherName: string;
}

const TeacherReviewsDisplay = ({ teacherId, teacherName }: TeacherReviewsDisplayProps) => {
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [teacherId]);

  const loadReviews = async () => {
    try {
      const fetchedReviews = await coordinatorReviewService.getTeacherReviews(teacherId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const coordinatorReviews = reviews.filter(r => r.reviewerType === 'coordinator');
  const studentReviews = reviews.filter(r => r.reviewerType === 'student');

  const avgCoordinatorRating = coordinatorReviewService.getAverageCoordinatorRating(reviews);
  const avgStudentRating = coordinatorReviewService.getAverageStudentRating(reviews);
  const avgOverallRating = coordinatorReviewService.getAverageRating(reviews);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: TeacherReview }) => {
    const reviewerName = review.reviewerType === 'coordinator' ? review.coordinatorName : review.studentName;
    return (
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {getInitials(reviewerName || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{reviewerName}</p>
                <Badge variant={review.reviewerType === 'coordinator' ? 'default' : 'secondary'} className="text-xs">
                  {review.reviewerType === 'coordinator' ? 'Coordinator' : 'Student'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {renderStars(review.rating)}
        </div>
        {review.comment && (
          <p className="text-sm text-foreground italic">"{review.comment}"</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Reviews</CardTitle>
              <CardDescription>No reviews yet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews have been submitted for {teacherName} yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Reviews</CardTitle>
              <CardDescription>{reviews.length} total review{reviews.length !== 1 ? 's' : ''}</CardDescription>
            </div>
          </div>
          {reviews.length > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <span className="text-2xl font-bold text-amber-500">{avgOverallRating}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground">Overall Rating</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="coordinator">
              Coordinator ({coordinatorReviews.length})
            </TabsTrigger>
            <TabsTrigger value="student">
              Student ({studentReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {reviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {coordinatorReviews.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Coordinator Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{avgCoordinatorRating}</span>
                      {renderStars(Math.round(avgCoordinatorRating))}
                    </div>
                  </div>
                )}
                {studentReviews.length > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Student Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">{avgStudentRating}</span>
                      {renderStars(Math.round(avgStudentRating))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="coordinator" className="space-y-3 mt-4">
            {coordinatorReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No coordinator reviews yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {coordinatorReviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="student" className="space-y-3 mt-4">
            {studentReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No student reviews yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {studentReviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeacherReviewsDisplay;
