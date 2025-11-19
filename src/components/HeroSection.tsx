import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroVisual from "./HeroVisual";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartLearning = () => {
    if (user) {
      if (user.role === 'student') navigate('/student-dashboard');
      else if (user.role === 'teacher') navigate('/teacher-dashboard');
      else if (user.role === 'coordinator') navigate('/coordinator-dashboard');
    } else {
      navigate('/signup');
    }
  };
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-mesh"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl"
        ></motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px)]"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge
                variant="outline"
                className="border-primary/40 text-primary bg-primary/10 uppercase tracking-widest text-xs font-semibold px-4 py-2 hover:shadow-glow transition-smooth"
              >
                <Sparkles className="w-3 h-3 mr-2 inline" />
                Enhance Your Life
              </Badge>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <div>Transform</div>
                <div className="relative inline-block">
                  <span className="text-primary">Your Skills and</span>
                  <svg className="absolute bottom-0 left-0 w-full h-2" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M 0 15 Q 50 5, 100 15 T 200 15" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary opacity-60" />
                  </svg>
                </div>
                <div>Career!</div>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                Meet the platform for modern design education. Master soft technical skills taught by industry experts.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                size="lg"
                className="group shadow-medium hover:shadow-strong transition-smooth bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold"
                onClick={() => {
                  const coursesSection = document.getElementById('courses-section');
                  if (coursesSection) {
                    coursesSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate("/courses");
                  }
                }}
              >
                Explore Courses
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group hover:bg-primary/10 transition-smooth"
                onClick={handleStartLearning}
              >
                <ArrowRight className="mr-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Start Learning Today
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row sm:items-center gap-8 pt-8"
            >
              <div className="flex items-center gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">769+</p>
                  <p className="text-sm text-muted-foreground">Recorded video</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div className="text-center sm:text-left">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">1200+</p>
                  <p className="text-sm text-muted-foreground">Happy Students</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div className="text-center sm:text-left">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">10+</p>
                  <p className="text-sm text-muted-foreground">Course Topic</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
