// Core type definitions for the LMS

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profilePicture?: string;
  username?: string;
  debitAccount?: string;
  isVerified?: boolean;
  manuallyVerified?: boolean;
  verificationType?: 'manual' | 'paystack';
  purchasedCourses?: string[];
  verifiedBy?: string;
  verifiedAt?: string;
}

export type UserRole = 'student' | 'coordinator' | 'teacher' | 'admin';

export interface UserRoleData {
  userId: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: 'NGN';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  instructorId?: string;
  instructorName?: string;
  instructorIds?: string[];
  instructorNames?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollmentCount: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  enrollmentCode: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentReference: string;
  amount: number;
  enrolledAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verified: boolean;
  verificationMethod: 'automatic' | 'manual' | 'paystack' | null;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: 'NGN';
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  verifiedAt: string | null;
  createdAt: string;
  metadata: {
    courseTitle: string;
    userName: string;
  };
}

export type ClassType = 'physical' | 'online';

export interface ScheduledClass {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  classType: ClassType;
  meetingLink: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  maxStudents: number;
  enrolledStudents: string[];
  createdAt: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ClassAttendance {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  enrollmentCode: string;
  attendedAt: string;
  status: 'present' | 'absent' | 'late';
}

export interface AccessCode {
  id: string;
  code: string;
  type: 'teacher' | 'coordinator';
  status: 'unused' | 'used';
  generatedAt: string;
  generatedBy: string;
  usedBy: string | null;
  usedAt: string | null;
}

export interface UserAccount {
  id: string;
  userId: string;
  accessCode: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'deleted';
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'generate_code' | 'delete_account' | 'reset_account' | 'suspend_account' | 'unsuspend_account';
  targetId: string;
  targetType: 'user' | 'code';
  details: string;
  timestamp: string;
}

export interface Meeting {
  id: string;
  title: string;
  roomName: string;
  roomId?: string;
  scheduledTime: string;
  teacherId: string;
  teacherName?: string;
  courseId?: string;
  participants: string[];
  createdAt: string;
  status?: 'scheduled' | 'ongoing' | 'completed';
  meetingHost?: string;
}

export type CourseRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CourseRequest {
  id: string;
  courseId: string;
  teacherId: string;
  teacherName: string;
  courseTitle: string;
  status: CourseRequestStatus;
  requestedDate: string;
  reviewedDate?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  teacherId: string;
  courseTitle: string;
  status: 'approved' | 'rejected';
  coordinatorName: string;
  reason: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  coordinatorId: string;
  coordinatorName: string;
  action: 'approved' | 'rejected';
  teacherId: string;
  teacherName: string;
  courseTitle: string;
  timestamp: string;
  details?: string;
}

export interface TeacherReview {
  id: string;
  courseId: string;
  teacherId: string;
  studentId?: string;
  studentName?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  reviewerType: 'student' | 'coordinator';
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseDetails {
  course: Course;
  teachers: User[];
  enrolledStudents: Enrollment[];
  completedMeetings: Meeting[];
  totalClassesHeld: number;
  averageRating: number;
  reviews: TeacherReview[];
}

export interface SpecialLink {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseTitle: string;
  writeUp: string;
  link: string;
  timestamp: string;
  createdAt?: string;
}
