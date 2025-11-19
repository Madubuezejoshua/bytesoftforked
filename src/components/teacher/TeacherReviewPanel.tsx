import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TeacherReview, Course } from '@/types';
import { Star, MessageCircle } from 'lucide-react';

interface TeacherReviewPanelProps {
  teacherId: string;
  courses: Course[];
  loading?: boolean;
}

export const TeacherReviewPanel = ({ teacherId, courses, loading = false }: TeacherReviewPanelProps) => {
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (!teacherId) return;

    const reviewsQuery = query(
      collection(db, 'teacher_reviews'),
      where('teacherId', '==', teacherId)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      snapshot => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TeacherReview[];
        setReviews(
          reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        setIsLoading(false);
      },
      error => {
        console.error('Error fetching reviews:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

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

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Student Reviews</CardTitle>
              <CardDescription>{reviews.length} reviews received</CardDescription>
            </div>
          </div>
          {reviews.length > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <span className="text-2xl font-bold text-amber-500">{averageRating}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Student reviews will appear here as students rate your teaching
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(review.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{review.studentName}</p>
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
                  <p className="text-xs text-muted-foreground">
                    For: <span className="font-medium">{
                      courses.find(c => c.id === review.courseId)?.title || 'Unknown Course'
                    }</span>
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
