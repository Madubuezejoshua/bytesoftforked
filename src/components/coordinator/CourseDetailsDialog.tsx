import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, Video, Star, Mail, Calendar } from 'lucide-react';
import { courseDetailsService } from '@/lib/courseDetailsService';
import { CourseDetails } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TeacherReviewsDisplay from './TeacherReviewsDisplay';
import CoordinatorReviewForm from './CoordinatorReviewForm';

interface CourseDetailsDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CourseDetailsDialog = ({ courseId, isOpen, onClose }: CourseDetailsDialogProps) => {
  const { user } = useAuth();
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      loadCourseDetails();
    }
  }, [isOpen, courseId]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const courseDetails = await courseDetailsService.getCourseDetails(courseId);
      setDetails(courseDetails);
    } catch (error) {
      console.error('Error loading course details:', error);
      toast.error('Failed to load course details');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Course Details</DialogTitle>
          <DialogDescription>View comprehensive information about this course</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        ) : details ? (
          <div className="space-y-6">
            <Card className="bg-muted/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{details.course.title}</CardTitle>
                    <CardDescription className="mt-2">{details.course.description}</CardDescription>
                  </div>
                  {details.course.thumbnailUrl && (
                    <img
                      src={details.course.thumbnailUrl}
                      alt={details.course.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-semibold">{details.course.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <Badge variant="outline" className="capitalize">{details.course.level}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{details.course.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold">₦{details.course.price.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="teachers" className="flex items-center gap-2">
                  <Users className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Teachers</span>
                  <span className="sm:hidden">Teachers</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Students</span>
                  <span className="sm:hidden">Students</span>
                </TabsTrigger>
                <TabsTrigger value="classes" className="flex items-center gap-2">
                  <Video className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Classes</span>
                  <span className="sm:hidden">Classes</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4 hidden sm:inline" />
                  <span className="hidden sm:inline">Reviews</span>
                  <span className="sm:hidden">Reviews</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teachers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Teacher Information
                    </CardTitle>
                    <CardDescription>
                      {details.teachers.length} teacher{details.teachers.length !== 1 ? 's' : ''} assigned
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.teachers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No teachers assigned to this course</p>
                    ) : (
                      <div className="space-y-4">
                        {details.teachers.map((teacher) => (
                          <div key={teacher.id} className="border rounded-lg p-4 flex items-start gap-4">
                            {teacher.profilePicture && (
                              <img
                                src={teacher.profilePicture}
                                alt={teacher.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold">{teacher.name}</h3>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                                <Mail className="w-4 h-4" />
                                {teacher.email}
                              </div>
                              <p className="text-muted-foreground text-xs mt-2">
                                Joined {formatDate(teacher.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Enrolled Students
                    </CardTitle>
                    <CardDescription>
                      {details.enrolledStudents.length} student{details.enrolledStudents.length !== 1 ? 's' : ''} enrolled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.enrolledStudents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No students enrolled yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-semibold">Name</th>
                              <th className="text-left py-2 px-2 font-semibold">Email</th>
                              <th className="text-left py-2 px-2 font-semibold">Code</th>
                              <th className="text-left py-2 px-2 font-semibold">Enrolled</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.enrolledStudents.map((enrollment) => (
                              <tr key={enrollment.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2">{enrollment.studentName}</td>
                                <td className="py-2 px-2">{enrollment.studentEmail}</td>
                                <td className="py-2 px-2">
                                  <Badge variant="outline">{enrollment.enrollmentCode}</Badge>
                                </td>
                                <td className="py-2 px-2 text-muted-foreground">
                                  {formatDate(enrollment.enrolledAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="classes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Classes Held
                    </CardTitle>
                    <CardDescription>
                      Total: {details.totalClassesHeld} completed class{details.totalClassesHeld !== 1 ? 'es' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {details.completedMeetings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No classes held yet</p>
                    ) : (
                      <div className="space-y-3">
                        {details.completedMeetings.map((meeting) => (
                          <div key={meeting.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold">{meeting.title}</h3>
                                <p className="text-muted-foreground text-sm">{meeting.teacherName}</p>
                              </div>
                              <Badge variant="default">Completed</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(meeting.scheduledTime)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
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
                {selectedTeacherId ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedTeacherId(null)}
                        className="text-sm text-primary hover:underline"
                      >
                        Back to Teachers
                      </button>
                      <h3 className="text-lg font-semibold">
                        {details.teachers.find(t => t.id === selectedTeacherId)?.name}
                      </h3>
                    </div>
                    <TeacherReviewsDisplay
                      key={`${selectedTeacherId}-${refreshReviews}`}
                      teacherId={selectedTeacherId}
                      teacherName={details.teachers.find(t => t.id === selectedTeacherId)?.name || 'Teacher'}
                    />
                    {user && (
                      <CoordinatorReviewForm
                        teacherId={selectedTeacherId}
                        courseId={details.course.id}
                        coordinatorId={user.id}
                        coordinatorName={user.name}
                        onReviewSubmitted={() => setRefreshReviews(!refreshReviews)}
                      />
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Teacher Reviews
                      </CardTitle>
                      <CardDescription>
                        Select a teacher to view and leave reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {details.teachers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6">No teachers assigned to this course</p>
                      ) : (
                        <div className="space-y-3">
                          {details.teachers.map(teacher => (
                            <button
                              key={teacher.id}
                              onClick={() => setSelectedTeacherId(teacher.id)}
                              className="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold group-hover:text-primary">{teacher.name}</p>
                                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                </div>
                                <Star className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailsDialog;
