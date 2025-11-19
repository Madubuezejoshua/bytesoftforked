import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course } from '@/types';
import CourseCard from '@/components/courses/CourseCard';
import PaymentModal from '@/components/courses/PaymentModal';
import EnrollmentSuccess from '@/components/courses/EnrollmentSuccess';
import TeacherDetailsDialog from '@/components/teacher/TeacherDetailsDialog';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const CourseCatalog = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [enrollmentCode, setEnrollmentCode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [showTeacherDetails, setShowTeacherDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [user, navigate]);

  const fetchCourses = async () => {
    const q = query(collection(db, 'courses'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
    setCourses(coursesData);
    setFilteredCourses(coursesData);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (code: string) => {
    setEnrollmentCode(code);
    setShowSuccess(true);
  };

  const handleViewTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setShowTeacherDetails(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      onClick: () => navigate(user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Course Catalog"
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        navigationItems={navigationItems}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              onViewTeacher={handleViewTeacher}
              showEnrollButton={user?.role === 'student'}
            />
          ))}
        </div>
      </main>

      <PaymentModal
        course={selectedCourse}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />

      <EnrollmentSuccess
        enrollmentCode={enrollmentCode}
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/student-dashboard');
        }}
      />

      {selectedTeacherId && (
        <TeacherDetailsDialog
          teacherId={selectedTeacherId}
          isOpen={showTeacherDetails}
          onClose={() => setShowTeacherDetails(false)}
        />
      )}
    </div>
  );
};

export default CourseCatalog;
