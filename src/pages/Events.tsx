import { motion } from 'framer-motion';
import { Calendar, Church, Clock, MapPin, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import EventCard from '@/components/common/EventCard';
import ChurchButton from '@/components/common/ChurchButton';

import stainedGlass from '@/assets/stained-glass.jpg';
import worship from '@/assets/worship.jpg';
import community from '@/assets/community.jpg';
import choir from '@/assets/choir.jpg';

const Events = () => {
  const upcomingEvents = [
    {
      title: 'Easter Sunday Celebration',
      date: 'April 20, 2025',
      time: '6:00 AM - 12:00 PM',
      location: 'Main Sanctuary',
      description: 'Join us for a glorious Easter sunrise service followed by our main worship celebration. Special choir performance and fellowship breakfast included.',
      image: worship,
    },
    {
      title: 'Community Outreach Day',
      date: 'April 27, 2025',
      time: '9:00 AM - 4:00 PM',
      location: 'Church Grounds & Local Community',
      description: 'A day dedicated to serving our neighbors through food distribution, home visits, and community cleanup initiatives.',
      image: community,
    },
    {
      title: 'Vacation Bible School',
      date: 'May 5-10, 2025',
      time: '9:00 AM - 1:00 PM',
      location: 'Church Hall',
      description: 'An exciting week of Bible stories, crafts, games, and music for children ages 5-12. Registration required.',
      image: choir,
    },
    {
      title: 'Youth Revival Camp',
      date: 'May 17-18, 2025',
      time: 'Overnight',
      location: 'Church Campus',
      description: 'Two days of worship, fellowship, and spiritual growth for young people. Features guest speakers and team activities.',
      image: worship,
    },
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
      schedule: 'Sunday (5th)',
      times: ['9:00 AM'],
      icon: <Clock size={24} />,
    },
    {
      title: 'Friday Malayalam Holy Communion',
      schedule: 'Every Friday',
      times: ['7:30 AM'],
      icon: <Church size={24} />,
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
              subtitle="Stay connected with what's happening at CSI AllSaints church Thrissur"
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Upcoming Events"
              subtitle="Mark your calendar for these special gatherings"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {upcomingEvents.map((event, index) => (
              <EventCard key={index} {...event} index={index} />
            ))}
          </div>
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
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="font-sans text-sm text-secondary font-medium mb-2">
                    {event.schedule}
                  </p>
                  <div className="space-y-1">
                    {event.times.map((time, i) => (
                      <p key={i} className="font-sans text-sm text-muted-foreground">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {annualEvents.map((event, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Calendar size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-foreground">
                      {event.name}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      {event.month}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
