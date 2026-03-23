import { motion } from 'framer-motion';
import { Calendar, Church, Clock, MapPin, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';
import EventCard from '@/components/common/EventCard';
import ChurchButton from '@/components/common/ChurchButton';
import Carousel from '@/components/common/Carousel';

import stainedGlass from '@/assets/stained-glass.jpg';
import worship from '@/assets/worship.jpg';
import churchInterior from '@/assets/church-interior.jpg';
import choir from '@/assets/choir.jpg';
import churchExterior011 from '@/assets/011.jpeg';
import heroChurch from '@/assets/hero-church.jpg';
import vbsImage from '@/assets/013.jpeg';

// Images for event cards (cycle through for calendar entries)
const eventCardImages = [
  churchExterior011,
  worship,
  stainedGlass,
  churchInterior,
  choir,
  heroChurch,
  churchExterior011,
  worship,
];

interface ChurchCalendarEntry {
  /** Date as shown to users (dd.mm.yyyy) */
  date: string;
  /** ISO date string (yyyy-mm-dd) used for sorting/filtering */
  isoDate: string;
  time: string;
  theme: string;
  subtitle?: string;
  readings: string;
}

const churchCalendarMarch: ChurchCalendarEntry[] = [
  { date: '22.03.2026', isoDate: '2026-03-22', time: 'Morning 7.30 English · Morning 9.00 Malayalam', theme: '2nd Sunday before Easter', subtitle: '5th Sunday of Lent · Passion Sunday · Cross: The Realization of Grace', readings: 'Mic | Ps | 1 Pet | Mark', },
  { date: '29.03.2026', isoDate: '2026-03-29', time: 'Morning 9.00', theme: 'Palm Sunday', subtitle: 'Let the King of Glory Enter', readings: '2 Kings | Ps | Phil | Luke', },
  { date: '02.04.2026', isoDate: '2026-04-02', time: 'Evening 6.00', theme: 'Maundy Thursday', subtitle: 'Holy Communion: Love That Gives Life', readings: 'Exo | Ps | 1 Cor | John', },
  { date: '03.04.2026', isoDate: '2026-04-03', time: 'Morning 8.30', theme: 'Good Friday', subtitle: 'Cross: The Celebration of Life', readings: 'Exo | Ps | 1 Cor | Mark', },
  { date: '05.04.2026', isoDate: '2026-04-05', time: 'Morning 5.00 Malayalam · 7.30 English · 9.00 Malayalam', theme: 'Easter', subtitle: 'Resurrection: Victory Over Death', readings: 'Isa | Ps | 2 Cor | Mark', },
];

const Events = () => {
  const today = new Date();

  // Filter church calendar so that only entries on/after today are shown,
  // sorted in ascending order by date.
  const upcomingCalendarEntries = churchCalendarMarch
    .filter((entry) => new Date(entry.isoDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime(),
    );

  // Build upcoming events: remaining calendar entries, then VBS (only if still upcoming)
  const upcomingEvents = [
    ...upcomingCalendarEntries.map((entry, i) => ({
      title: entry.theme,
      date: entry.date,
      time: entry.time,
      location: 'Main Sanctuary',
      description: [entry.subtitle, `Readings: ${entry.readings}`]
        .filter(Boolean)
        .join(' · '),
      image: eventCardImages[i % eventCardImages.length],
    })),
    // VBS after Easter – only show while still in the future
    ...(new Date('2026-04-06') >= today
      ? [
          {
            title: 'Vacation Bible School',
            date: 'April 6 – 10, 2026',
            time: '8:30 AM – 12:30 PM',
            location: 'Church Hall',
            description:
              'An exciting week of Bible stories, crafts, games, and music for children. Registration required.',
            image: vbsImage,
          },
        ]
      : []),
  ];

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
      {/* Hero Section */}
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

      {/* Upcoming Events — VBS + Church Calendar as cards with images */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Upcoming Events"
              subtitle="Church Calendar — March & early April"
            />
          </ScrollReveal>

          {upcomingEvents.length === 0 ? (
            <p className="mt-10 text-center font-sans text-muted-foreground">
              No upcoming events at this time. Please check back soon.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.date + event.title}
                  {...event}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Regular Schedule */}
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
                  <h3 className="text-h4 text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="font-sans text-sm text-foreground/90 font-medium mb-2">
                    {event.schedule}
                  </p>
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

      {/* Annual Events */}
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
                    <h3 className="text-h4 text-foreground">
                      {event.name}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      {event.month}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Call to Action */}
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
                <ChurchButton variant="hero">
                  Subscribe
                </ChurchButton>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
