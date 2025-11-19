import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroVisual = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="grid grid-cols-2 gap-3 auto-rows-max">
        {/* Large Featured Card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-2 row-span-2"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-8 backdrop-blur-sm h-full min-h-72"
          >
            <div className="relative z-10">
              <motion.div variants={floatingVariants} animate="animate">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Live Classes</span>
                </div>
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground leading-tight">
                Learn from Industry Experts
              </h3>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Interactive sessions with real-world projects and personalized feedback
              </p>
              <Button
                onClick={() => navigate("/courses")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                Explore Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </motion.div>

        {/* Stat Cards Row */}
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {/* Stat Card - Students */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200 dark:border-blue-500/20 p-6 backdrop-blur-sm h-full shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1,200+</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stat Card - Growth */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-500/10 dark:to-green-500/5 border border-green-200 dark:border-green-500/20 p-6 backdrop-blur-sm h-full shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Row - Large Card and Small Card */}
        <div className="col-span-2 grid grid-cols-3 gap-3">
          {/* Stat Card - Certified */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="col-span-2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 border border-purple-200 dark:border-purple-500/20 p-8 backdrop-blur-sm h-full shadow-lg"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Student Success
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Join thousands achieving their goals
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">98%</p>
                    <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
                  </div>
                  <Button
                    onClick={() => navigate("/courses")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl -z-10" />
            </motion.div>
          </motion.div>

          {/* Stat Card - Award */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-6 backdrop-blur-sm h-full shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Expert Led</p>
                  <p className="text-xs text-muted-foreground">Industry Experts</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Course Categories - Row Span */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="col-span-2"
        >
          <motion.div
            whileHover={{ scale: 1.01, y: -3 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-500/10 dark:via-primary/5 dark:to-transparent border border-blue-200 dark:border-primary/15 p-6 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  10+ Course Categories
                </h4>
                <p className="text-xs text-muted-foreground">
                  Design, Development, Trading & More
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/courses")}
                  className="text-primary hover:bg-primary/10"
                >
                  Browse
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-3xl -z-10"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -left-20 w-56 h-56 bg-primary/10 rounded-full blur-3xl -z-10"
      />
    </motion.div>
  );
};

export default HeroVisual;
