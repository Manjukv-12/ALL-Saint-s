import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import ChurchButton from './ChurchButton';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  index?: number;
}

const EventCard = ({ 
  title, 
  date, 
  time, 
  location, 
  description, 
  image,
  index = 0 
}: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-500 border border-border/50"
    >
      {/* Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
          
          {/* Date badge */}
          <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-sans text-sm font-medium shadow-lg">
            {date}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} className="text-primary" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} className="text-primary" />
            <span>{location}</span>
          </div>
        </div>

        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>

        <ChurchButton variant="ghost" size="sm">
          Learn More
        </ChurchButton>
      </div>
    </motion.div>
  );
};

export default EventCard;
