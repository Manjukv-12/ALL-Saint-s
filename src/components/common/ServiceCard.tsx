import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  time: string;
  description: string;
  index?: number;
}

const ServiceCard = ({ icon, title, time, description, index = 0 }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl p-8 shadow-card hover:shadow-medium transition-all duration-500 border border-border/50"
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-secondary/20 to-transparent transform rotate-45 translate-x-14 -translate-y-14" />
      </div>

      {/* Icon */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>

      {/* Content */}
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-secondary font-medium mb-3">
        {time}
      </p>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Hover line */}
      <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default ServiceCard;
