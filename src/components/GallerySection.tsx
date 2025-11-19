import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Star, BarChart3 } from "lucide-react";
import { Sparkles } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/types";

const GallerySection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
      setCourses(coursesData.slice(0, 6));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="courses-section" className="py-16 px-4 sm:px-8 bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-blue-500/20 bg-blue-500/5 px-4 py-1 text-sm font-medium"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 animate-pulse text-blue-500" />
            Course
          </Badge>
          <h2 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated collection of expert-led courses designed to accelerate your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No courses available
            </div>
          ) : (
            courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div
                  onClick={() => navigate('/courses')}
                  className="relative h-full rounded-2xl border border-blue-500/20 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-blue-500/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative overflow-hidden h-48 bg-muted">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500/90 text-white hover:bg-blue-500 text-xs font-semibold">
                        {course.level}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs">
                        {course.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {course.enrollmentCount} enrolled
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/courses')}
            className="px-8 py-3 border border-foreground/20 rounded-full font-semibold hover:bg-foreground/5 transition-all duration-300"
          >
            View Courses →
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
