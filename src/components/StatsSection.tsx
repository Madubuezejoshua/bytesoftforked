import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Award, Target, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Active Learners",
      description: "Students transforming their careers",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Award,
      value: "98%",
      label: "Success Rate",
      description: "Of our students achieve their goals",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      value: "300+",
      label: "Expert Courses",
      description: "In diverse skill areas",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Target,
      value: "24/7",
      label: "Learning Access",
      description: "Study on your own schedule",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-8 bg-background">
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
            Proven Results
          </Badge>
          <h2 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl mb-4">
            Numbers That Speak
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners who have already transformed their careers with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="relative min-h-[14rem] rounded-2xl border border-blue-500/20 bg-background/50 backdrop-blur-sm p-2 md:rounded-3xl md:p-3 hover:border-blue-500/40 transition-all duration-300">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500/[0.02] to-transparent">
                    <div className="w-fit rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-sans text-4xl font-bold text-foreground md:text-5xl">
                        {stat.value}
                      </h3>
                      <p className="font-sans text-sm font-semibold text-blue-500">
                        {stat.label}
                      </p>
                      <p className="font-sans text-sm text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
