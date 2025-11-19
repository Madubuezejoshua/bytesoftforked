'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';

export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-blue-500/10 p-1 py-0.5 font-bold text-blue-500',
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function TestimonialCard({
  description,
  name,
  img,
  role,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4',
        'border border-blue-500/20 bg-card/50 shadow-sm',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground text-sm font-normal select-none">
        {description}
        <div className="flex flex-row py-1">
          <Star className="size-4 fill-blue-500 text-blue-500" />
          <Star className="size-4 fill-blue-500 text-blue-500" />
          <Star className="size-4 fill-blue-500 text-blue-500" />
          <Star className="size-4 fill-blue-500 text-blue-500" />
          <Star className="size-4 fill-blue-500 text-blue-500" />
        </div>
      </div>
      <div className="flex w-full items-center justify-start gap-5 select-none">
        <img
          width={40}
          height={40}
          src={img || ''}
          alt={name}
          className="size-10 rounded-full ring-1 ring-blue-500/20 ring-offset-2"
        />
        <div>
          <p className="text-foreground font-medium">{name}</p>
          <p className="text-muted-foreground text-xs font-normal">{role}</p>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: 'Sarah Patel',
    role: 'Junior Web Developer',
    img: 'https://randomuser.me/api/portraits/women/32.jpg',
    description: (
      <p>
        This platform completely changed my career trajectory.
        <Highlight>
          I went from knowing nothing about web development to landing my first job in just 3 months.
        </Highlight>{' '}
        The courses are structured perfectly for beginners.
      </p>
    ),
  },
  {
    name: 'Marcus Johnson',
    role: 'UX/UI Designer',
    img: 'https://randomuser.me/api/portraits/men/45.jpg',
    description: (
      <p>
        The design courses here are industry-level quality.
        <Highlight>
          I've used these skills to rebrand my entire freelance business.
        </Highlight>{' '}
        My client rates increased by 40% after completing the certification.
      </p>
    ),
  },
  {
    name: 'Emma Chen',
    role: 'Career Changer to Tech',
    img: 'https://randomuser.me/api/portraits/women/22.jpg',
    description: (
      <p>
        As someone from a non-tech background, I was nervous.
        <Highlight>
          The supportive community and clear curriculum made the transition smooth.
        </Highlight>{' '}
        Now I'm building full-stack applications with confidence.
      </p>
    ),
  },
  {
    name: 'David Martinez',
    role: 'Data Analyst Professional',
    img: 'https://randomuser.me/api/portraits/men/38.jpg',
    description: (
      <p>
        The data science modules are comprehensive and practical.
        <Highlight>
          I applied what I learned immediately in my current role.
        </Highlight>{' '}
        My team now relies on my Python and analytics expertise daily.
      </p>
    ),
  },
  {
    name: 'Priya Kapoor',
    role: 'Digital Marketing Specialist',
    img: 'https://randomuser.me/api/portraits/women/55.jpg',
    description: (
      <p>
        These courses helped me master modern marketing strategies.
        <Highlight>
          My campaigns now generate 3x better ROI than before.
        </Highlight>{' '}
        The instructors really understand what works in today's digital landscape.
      </p>
    ),
  },
  {
    name: 'James Wilson',
    role: 'Backend Developer',
    img: 'https://randomuser.me/api/portraits/men/62.jpg',
    description: (
      <p>
        The advanced programming courses are exceptional.
        <Highlight>
          I learned cloud architecture and DevOps practices that transformed my development workflow.
        </Highlight>{' '}
        These skills led to a promotion and significant salary increase.
      </p>
    ),
  },
  {
    name: 'Asha Desai',
    role: 'Cybersecurity Specialist',
    img: 'https://randomuser.me/api/portraits/women/71.jpg',
    description: (
      <p>
        The cybersecurity curriculum is incredibly thorough and up-to-date.
        <Highlight>
          I earned my security certification and immediately started a new role.
        </Highlight>{' '}
        The hands-on labs made all the difference in my learning.
      </p>
    ),
  },
  {
    name: 'Carlos Mendez',
    role: 'Mobile App Developer',
    img: 'https://randomuser.me/api/portraits/men/81.jpg',
    description: (
      <p>
        From iOS to React Native, the mobile development courses cover everything.
        <Highlight>
          I launched two apps that have over 10K downloads.
        </Highlight>{' '}
        The community support throughout the journey was invaluable.
      </p>
    ),
  },
  {
    name: 'Nina Rossi',
    role: 'Graphic Designer',
    img: 'https://randomuser.me/api/portraits/women/26.jpg',
    description: (
      <p>
        The design thinking and advanced graphics courses are world-class.
        <Highlight>
          I've tripled my freelance income after completing the program.
        </Highlight>{' '}
        My portfolio work now attracts premium clients worldwide.
      </p>
    ),
  },
  {
    name: 'Leo Santos',
    role: 'Machine Learning Engineer',
    img: 'https://randomuser.me/api/portraits/men/17.jpg',
    description: (
      <p>
        The AI and machine learning courses are cutting-edge.
        <Highlight>
          I went from data analyst to ML engineer in under a year.
        </Highlight>{' '}
        Now I'm building models that directly impact business decisions.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <section className="relative container py-10">
      <div className="absolute top-20 -left-20 z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="mb-4 rounded-full border-blue-500/20 bg-blue-500/5 px-4 py-1 text-sm font-medium inline-flex items-center">
            <span className="inline-flex items-center gap-1 text-blue-500">
              <svg className="h-3.5 w-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Student Success Stories
            </span>
          </div>
        </div>
        <h2 className="text-foreground mb-4 text-center text-4xl leading-[1.2] font-bold tracking-tighter md:text-5xl font-heading">
          Student Success Stories
        </h2>
        <h3 className="text-muted-foreground mx-auto mb-8 max-w-lg text-center text-lg font-medium tracking-tight text-balance">
          Join thousands of students who transformed their careers. Here&apos;s what our{' '}
          <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
            learners are achieving
          </span>
        </h3>
      </motion.div>
      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  '[--duration:60s]': i === 1,
                  '[--duration:30s]': i === 2,
                  '[--duration:70s]': i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-20%"></div>
        <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-20%"></div>
      </div>
    </section>
  );
}
