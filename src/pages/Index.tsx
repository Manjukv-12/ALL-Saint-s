import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Clock, Heart, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import ServiceCard from '@/components/common/ServiceCard';
import EventCard from '@/components/common/EventCard';
import Carousel from '@/components/common/Carousel';

import heroVideo from '@/assets/video/droneshot.mp4';
import interiorImage from '@/assets/church-interior.jpg';
import worshipImage from '@/assets/worship.jpg';
import communityImage from '@/assets/community.jpg';

const HERO_VIDEO_PLAYBACK_RATE = 0.5; // Slower: 0.5 = half speed

const Index = () => {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (video) {
      video.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
    }
  }, []);

  const services = [
    {
      icon: <Church size={28} />,
      title: 'Malayalam Holy Communion',
      time: 'Sunday 9:00 AM (1st, 2nd, 3rd & 4th)',
      description: 'Join us for Holy Communion in Malayalam on the first four Sundays of the month.',
    },
    {
      icon: <Church size={28} />,
      title: 'English Holy Communion',
      time: 'Sunday 7:30 AM (2nd & 4th)',
      description: 'Holy Communion in English on the second and fourth Sundays of the month.',
    },
    {
      icon: <Church size={28} />,
      title: 'Malayalam Matins',
      time: 'Sunday 9:00 AM (5th)',
      description: 'Malayalam Matins service on the fifth Sunday of the month.',
    },
    {
      icon: <Heart size={28} />,
      title: 'Fasting Prayer',
      time: 'Friday 10:30 AM',
      description: 'A time of fasting and prayer every Friday.',
    },
  ];

  const upcomingEvents = [
    {
      title: 'Easter Sunday Service',
      date: 'April 20',
      time: '6:00 AM - 12:00 PM',
      location: 'Main Sanctuary',
      description: 'Celebrate the resurrection of Christ with special sunrise service and worship.',
      image: worshipImage,
    },
    {
      title: 'Community Outreach Day',
      date: 'April 27',
      time: '9:00 AM - 4:00 PM',
      location: 'Church Grounds',
      description: 'Join us as we serve our local community with love and compassion.',
      image: communityImage,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden
            onLoadedMetadata={(e) => {
              (e.target as HTMLVideoElement).playbackRate = HERO_VIDEO_PLAYBACK_RATE;
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto py-12 px-6 rounded-3xl bg-black/10 backdrop-blur-[2px] border border-white/5 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-primary-foreground font-semibold mb-6 leading-tight drop-shadow-2xl"
            >
              All Saints’ CSI Church
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="font-serif text-xl md:text-2xl text-primary-foreground/90 italic mb-8 drop-shadow-lg"
            >
              Thrissur, Kerala
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="font-sans text-base md:text-lg text-primary-foreground max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
            >
              A welcoming community of faith, hope, and love. Join us as we walk together in the light of Christ.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <ChurchButton variant="hero" size="lg" asLink href="/services">
                Join Our Services
              </ChurchButton>
              <ChurchButton variant="outline" size="lg" asLink href="/about" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Learn About Us
              </ChurchButton>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 bg-primary-foreground/70 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-gradient-warm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={interiorImage}
                    alt="Church Interior"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <SectionTitle
                  title="A Place of Peace & Faith"
                  subtitle="The Church of South India (C.S.I.)"
                  centered={false}
                />
                <div className="mt-8 space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    In the second half of the 18th century, several European missionaries representing various missionary organizations began gospel work in India. In Kerala, three main missionary organizations were active: the C.M.S. (1816), L.M.S. (1806), and the Basel Mission (1834). These three followed different church traditions: the Basel Mission followed the Presbyterian tradition, the L.M.S. followed the Congregational tradition, and the C.M.S. followed the Anglican tradition. The churches they established continued these traditions.
                    At the beginning of the 20th century, a realization grew that churches living and functioning in division were losing their Christian witness. Along with this, the influence of nationalism led to efforts toward creating an Indian Church. Missionaries gave a great call for unity:
                  </p>
                  <p>
                    * 1901: Presbyterian churches joined together as one church.
                    * 1906: Congregational churches joined together as one church.
                    * 1908: Congregational and Presbyterian churches joined to form the S.I.U.C. (South India United Church).
                    * 1919: At a meeting held in Tranquebar (Tharangampadi) led by Bishop V.S. Azariah, Christian workers issued an invitation for church unity.
                    * 1919: Discussions began between the S.I.U.C. and the Anglican Church.
                    * 1925: The Methodist Church joined the discussions.
                    * 1947: These three churches became one.
                  </p>
                  <p>This was the result of 28 years of prayer and discussion. For the first time in history, Episcopal and Non-Episcopal churches joined to form the Church of South India. The ceremonies took place at St. George Cathedral, Madras, and the inauguration was on September 27, 1947.</p>
                </div>
                <div className="mt-8">
                  <ChurchButton variant="primary" asLink href="/about">
                    Our Story
                  </ChurchButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Our Services"
              subtitle="Join us in worship and fellowship throughout the week"
            />
          </ScrollReveal>

          <Carousel className="mt-16">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} index={index} />
            ))}
          </Carousel>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12">
              <ChurchButton variant="secondary" asLink href="/services">
                View All Services
              </ChurchButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <p className="font-serif text-2xl md:text-4xl text-primary-foreground italic leading-relaxed">
                "Come to me, all you who are weary and burdened, and I will give you rest."
              </p>
              <p className="font-sans text-secondary mt-6 text-lg">
                — Matthew 11:28
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Upcoming Events"
              subtitle="Mark your calendar for these special gatherings"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            {upcomingEvents.map((event, index) => (
              <EventCard key={index} {...event} index={index} />
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-12">
              <ChurchButton variant="outline" asLink href="/events">
                View All Events
              </ChurchButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-warm">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <SectionTitle
                title="You Are Welcome Here"
                subtitle="Whether you're seeking answers, looking for community, or simply curious about faith, we invite you to join us"
              />
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <ChurchButton variant="primary" size="lg" asLink href="/contact">
                  Plan Your Visit
                </ChurchButton>
                <ChurchButton variant="ghost" size="lg" asLink href="/contact">
                  Contact Us
                </ChurchButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
