import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartLearning = () => {
    if (user) {
      if (user.role === 'student') navigate('/student-dashboard');
      else if (user.role === 'teacher') navigate('/teacher-dashboard');
      else if (user.role === 'coordinator') navigate('/coordinator-dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleExploreCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/courses');
    }
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 sm:p-12 md:p-16">
          <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading">
                Ready to Transform Your Future?
              </h2>
              <p className="mb-8 max-w-2xl text-base sm:text-lg text-blue-100">
                Start your learning journey today and unlock your potential. Join thousands of students already advancing their careers with our expert-led courses and supportive community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row sm:gap-4"
            >
              <button
                onClick={handleStartLearning}
                className="flex items-center justify-center gap-2 rounded-full bg-white text-blue-700 px-6 sm:px-8 py-3 font-semibold hover:bg-blue-50 transition-colors group"
              >
                <span>Start Learning Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleExploreCourses}
                className="flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                <span>Explore Courses</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
