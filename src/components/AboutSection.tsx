import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const AboutSection = () => {
  const benefits = [
    "Learn from industry experts",
    "Hands-on projects and assignments",
    "Personalized learning path",
    "24/7 access to course materials",
    "Community of learners",
    "Career support and guidance",
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Learners Worldwide
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              ByteSoft is more than just an online learning platform. We're a community
              dedicated to helping you unlock your potential and achieve your dreams through 
              quality education and expert guidance.
            </p>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <Button size="lg" variant="hero">
              Start Learning Today
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-strong">
              <img
                src="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Learning Community"
                className="w-full h-96 object-cover group-hover:scale-105 transition-smooth duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <motion.div
              className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur rounded-xl p-6 shadow-strong"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">10K+</div>
                <p className="font-semibold mb-1">Active Students</p>
                <p className="text-sm text-muted-foreground">Learning and growing every day</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
