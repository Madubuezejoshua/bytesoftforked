"use client";

import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Rocket, Zap, Crown, Sparkles, Code, Users } from "lucide-react";

const services = [
  {
    icon: <Code className="h-5 w-5 text-blue-500" />,
    title: "Expert-Led Instruction",
    description: "Learn directly from industry professionals with years of real-world experience in design and development. Master modern techniques and best practices.",
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
  },
  {
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    title: "Hands-On Projects",
    description: "Apply what you learn immediately with real-world projects and assignments. Build your portfolio while mastering practical design skills.",
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
  },
  {
    icon: <Rocket className="h-5 w-5 text-blue-500" />,
    title: "Flexible Learning",
    description: "Study at your own pace with 24/7 access to all course materials. Balance education with your personal and professional commitments.",
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
  },
  {
    icon: <Crown className="h-5 w-5 text-blue-500" />,
    title: "Recognized Certificates",
    description: "Earn industry-recognized certificates upon completion. Showcase your achievements and boost your career with verified credentials.",
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
  },
  {
    icon: <Users className="h-5 w-5 text-blue-500" />,
    title: "Community Support",
    description: "Connect with thousands of learners worldwide. Get help when you need it, share knowledge, and grow together in a supportive community.",
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
  }
];

interface ServiceItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceItem = ({ area, icon, title, description }: ServiceItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-blue-500/20 bg-background/50 backdrop-blur-sm p-2 md:rounded-3xl md:p-3 hover:border-blue-500/40 transition-all duration-300">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-gradient-to-br from-blue-500/[0.02] to-transparent">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="font-sans text-xl/[1.375rem] font-semibold text-balance text-foreground md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <p className="font-sans text-sm/[1.125rem] text-muted-foreground md:text-base/[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function FeaturesSection() {
  return (
    <div className="relative py-16 px-4 sm:px-8 bg-background">
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
            Why Choose ByteSoft
          </Badge>
          <h2 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl mb-4">
            Empowering Your Design Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover what makes ByteSoft the ultimate platform for modern design education. We combine expert instruction, practical learning, and community support to transform your career.
          </p>
        </div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:max-h-[34rem] xl:grid-rows-2">
          {services.map((service, index) => (
            <ServiceItem
              key={index}
              area={service.area}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
