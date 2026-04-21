import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Church, Clock, MapPin, Users, X, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';
import EventCard from '@/components/common/EventCard';
import ChurchButton from '@/components/common/ChurchButton';
import Carousel from '@/components/common/Carousel';
import { eventImageUrl, getPublicEvents } from '@/lib/api';

import stainedGlass from '@/assets/stained-glass.jpg';
import heroChurch from '@/assets/hero-church.jpg';

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const Events = () => {
  const [selectedEventImage, setSelectedEventImage] = useState<{ src: string; alt: string } | null>(null);

  const { data: apiEvents, isLoading, isError, error } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: getPublicEvents,
  });

  const regularEvents = [
    {
      title: 'Malayalam Holy Communion',
      schedule: 'Sunday (1st, 2nd, 3rd & 4th)',
      times: ['9:00 AM'],
      icon: <Calendar size={24} />,
    },
    {
      title: 'English Holy Communion',
      schedule: 'Sunday (2nd & 4th)',
      times: ['7:30 AM'],
      icon: <Church size={24} />,
    },
    {
      title: 'Malayalam Matins',
      schedule: 'Sunday 9:00 AM (5th)',
      times: [],
      icon: <Clock size={24} />,
    },
    {
      title: 'Fasting Prayer',
      schedule: 'Every Friday',
      times: ['10:30 AM'],
      icon: <Users size={24} />,
    },
  ];

  const annualEvents = [
    { name: 'Christmas Celebrations', month: 'December' },
    { name: 'Easter Services', month: 'March/April' },
    { name: 'Harvest Festival', month: 'November' },
    { name: 'Church Anniversary', month: 'November 1st' },
    { name: 'Good Friday Service', month: 'March/April' },
    { name: 'Confirmation Sunday', month: 'April' },
  ];

  return (
    <Layout>
      <section className="relative pt-32 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={stainedGlass} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SectionTitle
              title="Events & Calendar"
              subtitle={<>Stay connected with what's happening at <ChurchName /></>}
              light
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <SectionTitle title="Upcoming Events" />
            </div>
          </ScrollReveal>

          {isLoading && (
            <div className="mt-16 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin w-10 h-10" aria-hidden />
              <span className="sr-only">Loading events</span>
            </div>
          )}

          {isError && (
            <p className="mt-10 text-center font-sans text-destructive text-sm">
              {error instanceof Error ? error.message : 'Could not load events. Is the database table created and PHP running?'}
            </p>
          )}

          {!isLoading && !isError && (apiEvents?.length ?? 0) === 0 && (
            <p className="mt-10 text-center font-sans text-muted-foreground">
              No upcoming events at this time. Please check back soon.
            </p>
          )}

          {!isLoading && !isError && apiEvents && apiEvents.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {apiEvents.map((row, index) => {
                const img = eventImageUrl(row.image) ?? heroChurch;
                return (
                  <EventCard
                    key={row.id}
                    title={row.title}
                    date={formatEventDate(row.created_at)}
                    time={row.time ?? ''}
                    location={row.location ?? ''}
                    description={row.description ?? ''}
                    image={img}
                    index={index}
                    onImageClick={(src, alt) => setSelectedEventImage({ src, alt })}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedEventImage && (
        <div
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedEventImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Event image preview"
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-[120] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            onClick={() => setSelectedEventImage(null)}
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>
          <img
            src={selectedEventImage.src}
            alt={selectedEventImage.alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Weekly Schedule"
              subtitle="Regular gatherings for worship and fellowship"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {regularEvents.map((event, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    {event.icon}
                  </div>
                  <h3 className="text-h4 text-foreground mb-2">{event.title}</h3>
                  <p className="font-sans text-sm text-foreground/90 font-medium mb-2">{event.schedule}</p>
                  <div className="space-y-1">
                    {event.times.map((time, i) => (
                      <p key={i} className="font-sans text-sm font-medium text-foreground/85">
                        {time}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Annual Celebrations"
              subtitle="Special events that mark our church calendar"
            />
          </ScrollReveal>

          <Carousel
            className="mt-16"
            mode="loop"
            options={{ loop: true, align: 'start' }}
            slideClassName="sm:flex-[0_0_50%] lg:flex-[0_0_33.33%]"
          >
            {annualEvents.map((event, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 h-full">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-h4 text-foreground">{event.name}</h3>
                    <p className="font-sans text-sm text-muted-foreground">{event.month}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <SectionTitle
                title="Don't Miss Out"
                subtitle="Subscribe to our newsletter to stay updated on all church events and announcements"
                light
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-6 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-secondary"
                />
                <ChurchButton variant="hero">Subscribe</ChurchButton>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
