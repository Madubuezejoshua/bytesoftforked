import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

const items = [
  {
    id: '1',
    title: 'What makes this platform different?',
    content:
      'Our platform is designed with learners in mind, offering a fully comprehensive, interactive learning experience built using modern technologies. No bloated courses, no unnecessary content—just focused, practical education to help you master new skills quickly and effectively.',
  },
  {
    id: '2',
    title: 'How can I customize my learning experience?',
    content:
      'You have full control over your learning journey. Choose your pace, select courses that interest you, and customize your learning path. Our platform supports various learning styles with video lectures, interactive projects, and real-world assessments tailored to your needs.',
  },
  {
    id: '3',
    title: 'Are courses available on mobile devices?',
    content:
      "Absolutely! All courses are fully responsive and optimized for mobile devices. Learn on-the-go from your smartphone, tablet, or desktop. Download lessons for offline access and continue learning anywhere, anytime without interruption.",
  },
  {
    id: '4',
    title: 'Can I get a certificate after completing a course?',
    content:
      'Yes, upon completing any course, you receive a professional certificate that you can share on LinkedIn and other professional networks. Our certificates are recognized by industry leaders and add real value to your professional profile.',
  },
  {
    id: '5',
    title: 'What kind of support is available?',
    content:
      "We provide comprehensive support through multiple channels: live instructor Q&A sessions, community forums where you can connect with other learners, email support, and detailed documentation. Our community is vibrant and always ready to help fellow learners succeed.",
  },
];

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
    },
  }),
};

export default function FAQSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <Badge
              variant="outline"
              className="rounded-full border-blue-500/20 bg-blue-500/5 px-4 py-1 text-sm font-medium"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5 animate-pulse text-blue-500" />
              FAQ
            </Badge>
          </motion.div>
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked{' '}
            <span className="from-blue-500 to-sky-500 bg-gradient-to-r bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about our platform and how to use our
            learning resources to achieve your goals.
          </motion.p>
        </div>

        <motion.div
          className="relative mx-auto max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute -top-4 -left-4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-4 -bottom-4 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <Accordion
            type="single"
            collapsible
            className="border-blue-500/20 bg-card/30 w-full rounded-xl border p-2 backdrop-blur-sm"
            defaultValue="1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={item.id}
                  className={cn(
                    'bg-card/50 my-1 overflow-hidden rounded-lg border-none px-2 shadow-sm transition-all',
                    'data-[state=open]:bg-card/80 data-[state=open]:shadow-md',
                  )}
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={cn(
                        'group flex flex-1 items-center justify-between gap-4 py-4 text-left text-base font-medium',
                        'hover:text-blue-500 transition-all duration-300 outline-none',
                        'focus-visible:ring-blue-500/50 focus-visible:ring-2',
                        'data-[state=open]:text-blue-500',
                      )}
                    >
                      {item.title}
                      <PlusIcon
                        size={18}
                        className={cn(
                          'text-blue-500/70 shrink-0 transition-transform duration-300 ease-out',
                          'group-data-[state=open]:rotate-45',
                        )}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent
                    className={cn(
                      'text-muted-foreground overflow-hidden pt-0 pb-4',
                      'data-[state=open]:animate-accordion-down',
                      'data-[state=closed]:animate-accordion-up',
                    )}
                  >
                    <div className="border-t border-blue-500/30 pt-3">
                      {item.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
