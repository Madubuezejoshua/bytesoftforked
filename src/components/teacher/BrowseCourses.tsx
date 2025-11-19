import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, CourseRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import RequestTeachDialog from './RequestTeachDialog';

interface BrowseCoursesProps {
  teacherId: string;
  teacherName: string;
}

const BrowseCourses = ({ teacherId, teacherName }: BrowseCoursesProps) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [teacherRequests, setTeacherRequests] = useState<CourseRequest[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestingCourseId, setRequestingCourseId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const coursesQuery = query(
        collection(db, 'courses'),
        where('isActive', '==', true)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setAllCourses(coursesData);
      setFilteredCourses(coursesData);

      const uniqueCategories = Array.from(
        new Set(coursesData.map(c => c.category))
      ).sort();
      setCategories(uniqueCategories);

      const requestsQuery = query(
        collection(db, 'course_requests'),
        where('teacherId', '==', teacherId)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseRequest[];
      setTeacherRequests(requestsData);

      const teacherCoursesQuery = query(
        collection(db, 'courses'),
        where('instructorId', '==', teacherId)
      );
      const teacherCoursesSnapshot = await getDocs(teacherCoursesQuery);
      const teacherCourseIds = teacherCoursesSnapshot.docs.map(doc => doc.id);

      const multiInstructorCourses = coursesData.filter(course =>
        course.instructorIds?.includes(teacherId)
      );
      const allTeacherCourseIds = [...teacherCourseIds, ...multiInstructorCourses.map(c => c.id)];
      setTeacherCourses(Array.from(new Set(allTeacherCourseIds)));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allCourses;

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedLevel, allCourses]);

  const getButtonState = (courseId: string) => {
    if (teacherCourses.includes(courseId)) {
      return { disabled: true, label: 'Already Teaching', variant: 'secondary' as const };
    }

    const existingRequest = teacherRequests.find(r => r.courseId === courseId);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return { disabled: true, label: 'Request Pending', variant: 'secondary' as const };
      } else if (existingRequest.status === 'approved') {
        return { disabled: true, label: 'Request Approved', variant: 'secondary' as const };
      } else if (existingRequest.status === 'rejected') {
        return { disabled: false, label: 'Request Again', variant: 'default' as const };
      }
    }

    return { disabled: false, label: 'Request to Teach', variant: 'default' as const };
  };

  const handleRequestClick = (course: Course) => {
    setSelectedCourse(course);
    setRequestingCourseId(course.id);
    setShowRequestDialog(true);
  };

  const handleRequestSuccess = async () => {
    setShowRequestDialog(false);
    setRequestingCourseId(null);
    setSelectedCourse(null);
    await fetchData();
    toast.success('Request submitted successfully!');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading courses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Browse Courses</CardTitle>
          <CardDescription>Discover and request to teach available courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No courses found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const buttonState = getButtonState(course.id);
            const instructorNames = course.instructorNames || (course.instructorName ? [course.instructorName] : []);

            return (
              <Card key={course.id} className="shadow-soft hover:shadow-medium transition-smooth overflow-hidden flex flex-col">
                <div className="relative h-48 bg-muted">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-4 right-4 ${getLevelColor(course.level)}`}>
                    {course.level}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{course.enrollmentCount} enrolled</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Instructors</p>
                    {instructorNames.length > 0 ? (
                      <div className="space-y-1">
                        {instructorNames.map((name, idx) => (
                          <p key={idx} className="text-sm font-medium">{name}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No instructors assigned</p>
                    )}
                  </div>
                </CardContent>

                <div className="p-4 border-t border-border">
                  <Button
                    className="w-full"
                    disabled={buttonState.disabled}
                    variant={buttonState.variant}
                    onClick={() => handleRequestClick(course)}
                  >
                    {buttonState.label}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <RequestTeachDialog
          isOpen={showRequestDialog}
          onClose={() => {
            setShowRequestDialog(false);
            setRequestingCourseId(null);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          teacherId={teacherId}
          teacherName={teacherName}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default BrowseCourses;
