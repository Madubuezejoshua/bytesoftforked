import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, BookOpen, Star, Mail, Calendar, Award } from 'lucide-react';
import { teacherService, TeacherDetails } from '@/lib/teacherService';
import { toast } from 'sonner';

interface TeacherDetailsDialogProps {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeacherDetailsDialog = ({ teacherId, isOpen, onClose }: TeacherDetailsDialogProps) => {
  const [details, setDetails] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && teacherId) {
      loadTeacherDetails();
    }
  }, [isOpen, teacherId]);

  const loadTeacherDetails = async () => {
    setLoading(true);
    try {
      const teacherDetails = await teacherService.getTeacherDetails(teacherId);
      setDetails(teacherDetails);
    } catch (error) {
      console.error('Error loading teacher details:', error);
      toast.error('Failed to load teacher details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!details && !loading) {
    return null;
  }

  const teacherInitials = details
    ? details.teacher.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
          <DialogDescription>View detailed information about the instructor</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading teacher details...</p>
          </div>
        ) : details ? (
          <div className="space-y-6">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 flex-shrink-0">
                    {details.teacher.profilePicture ? (
                      <img src={details.teacher.profilePicture} alt={details.teacher.name} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                        {teacherInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold">{details.teacher.name}</h2>
                      <p className="text-muted-foreground">Instructor</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${details.teacher.email}`} className="hover:text-primary truncate">
                        {details.teacher.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(details.teacher.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{details.totalStudentsEnrolled}</div>
                    <p className="text-sm text-muted-foreground mt-1">Students Taught</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex justify-center">{renderStars(details.averageRating)}</div>
                    <p className="text-sm text-muted-foreground mt-2">Average Rating</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{details.coursesTaught.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Courses Taught</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Courses</span>
                  <span className="sm:hidden">Courses</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Reviews</span>
                  <span className="sm:hidden">Reviews</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Courses Taught
                    </CardTitle>
                    <CardDescription>
                      {details.coursesTaught.length} course{details.coursesTaught.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.coursesTaught.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No courses assigned yet</p>
                    ) : (
                      <div className="space-y-4">
                        {details.coursesTaught.map((course) => (
                          <div key={course.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-4">
                              {course.thumbnailUrl && (
                                <img
                                  src={course.thumbnailUrl}
                                  alt={course.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {course.description}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge variant="outline" className="capitalize">
                                    {course.level}
                                  </Badge>
                                  <Badge variant="secondary">{course.category}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {course.enrollmentCount} enrolled
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Student Reviews
                    </CardTitle>
                    <CardDescription>
                      {details.totalReviews} review{details.totalReviews !== 1 ? 's' : ''} from students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.reviews.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No reviews yet</p>
                    ) : (
                      <div className="space-y-4">
                        {details.reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold">{review.studentName}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                              </div>
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDetailsDialog;
