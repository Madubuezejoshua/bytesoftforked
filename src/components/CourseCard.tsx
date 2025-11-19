import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CourseCardProps {
  title: string;
  image: string;
  delay?: number;
}

const CourseCard = ({ title, image, delay = 0 }: CourseCardProps) => {
  return (
    <motion.div
      animate={{ 
        y: [0, -20, 0],
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      className="perspective-1000"
    >
      <Card 
        className="overflow-hidden bg-card backdrop-blur-sm border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer transform hover:scale-105"
        style={{
          transform: 'rotateX(5deg) rotateY(-5deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative">
          <img 
            src={image} 
            alt={title}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        <div className="p-5 bg-gradient-to-br from-card/95 to-card/80">
          <h3 className="font-semibold text-base font-heading text-foreground">{title}</h3>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
