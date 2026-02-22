import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Wine, Sunrise, Heart, Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import ServiceCard from '@/components/common/ServiceCard';
import Carousel from '@/components/common/Carousel';
import Timeline from '@/components/common/Timeline';

import heroVideo from '@/assets/video/allsaints.mp4';
import churchExterior from '@/assets/013.jpeg';
import interiorImage from '@/assets/church-interior.jpg';
import HeroSlider from '@/components/common/HeroSlider';

const HERO_VIDEO_PLAYBACK_RATE = 0.5; // Slower: 0.5 = half speed
const HERO_VIDEO_START_TIME = 5; // Skip 5s intro, start from this point

const csiHistoryTimeline = [
  { date: '1901', title: 'Presbyterian churches unite', description: 'Presbyterian churches joined together as one church.' },
  { date: '1906', title: 'Congregational churches unite', description: 'Congregational churches joined together as one church.' },
  { date: '1908', title: 'S.I.U.C. formed', description: 'Congregational and Presbyterian churches joined to form the S.I.U.C. (South India United Church).' },
  { date: '1919', title: 'Tranquebar call for unity', description: 'At a meeting held in Tranquebar (Tharangampadi) led by Bishop V.S. Azariah, Christian workers issued an invitation for church unity.' },
  { date: '1919', title: 'S.I.U.C. and Anglican discussions', description: 'Discussions began between the S.I.U.C. and the Anglican Church.' },
  { date: '1925', title: 'Methodist Church joins', description: 'The Methodist Church joined the discussions.' },
  { date: '1947', title: 'Church of South India', description: 'These three churches became one. For the first time in history, Episcopal and Non-Episcopal churches joined to form the C.S.I. The ceremonies took place at St. George Cathedral, Madras, and the inauguration was on September 27, 1947.' },
];

const Index = () => {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
    const onTimeUpdate = () => {
      if (video.currentTime < HERO_VIDEO_START_TIME && video.currentTime > 0) {
        video.currentTime = HERO_VIDEO_START_TIME;
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  const handleHeroSlideChange = (index: number) => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (index === 0) video.play().catch(() => { });
    else video.pause();
  };

  const services = [
    {
      icon: <Church size={28} />,
      title: 'Malayalam Holy Communion',
      time: 'Sunday 9:00 AM (1st, 2nd, 3rd & 4th)',
      description: 'Join us for Holy Communion in Malayalam on the first four Sundays of the month.',
    },
    {
      icon: <Wine size={28} />,
      title: 'English Holy Communion',
      time: 'Sunday 7:30 AM (2nd & 4th)',
      description: 'Holy Communion in English on the second and fourth Sundays of the month.',
    },
    {
      icon: <Sunrise size={28} />,
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


  return (
    <Layout>
      {/* Hero slider: video then church exterior image */}
      <section className="relative pt-14 sm:pt-16 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden bg-black">
        <HeroSlider
          autoplay
          autoplayDelays={[15000, 22000]}
          onSlideChange={handleHeroSlideChange}
          className="h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]"
        >
          {/* Slide 1: Video */}
          <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
            <motion.div
              className="absolute inset-0 w-full h-full"
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
                className="absolute inset-0 w-full h-full object-cover object-center"
                aria-hidden
                onLoadedMetadata={(e) => {
                  const v = e.target as HTMLVideoElement;
                  v.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
                  v.currentTime = HERO_VIDEO_START_TIME;
                }}
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-center z-10">
              <div className="container mx-auto px-4 max-w-4xl">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-h1 font-old-english text-hero-title mb-6 hero-text-shadow"
                >
                  All Saints’ C.S.I. Church
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="text-h2 text-hero-subtitle italic mb-8 hero-text-shadow"
                >
                  Thrissur, Kerala
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="flex justify-center"
                >
                  <ChurchButton variant="primary" size="lg" asLink href="/services" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Join Our Services
                  </ChurchButton>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Slide 2: Church exterior image */}
          <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
            <img
              src={churchExterior}
              alt="CSI All Saints Church Thrissur"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 flex items-center justify-center text-center z-10">
              <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-h1 font-old-english text-hero-title mb-6 hero-text-shadow">
                  All Saints' C.S.I. Church
                </h1>
                <p className="text-h2 text-hero-subtitle italic mb-10 hero-text-shadow">
                  Thrissur, Kerala
                </p>
                <div className="flex justify-center">
                  <ChurchButton variant="primary" size="lg" asLink href="/services" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Join Our Services
                  </ChurchButton>
                </div>
              </div>
            </div>
          </div>
        </HeroSlider>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-section-tint">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-stretch">
            <ScrollReveal direction="left">
              <div className="flex flex-col">
                <SectionTitle
                  title="A Place of Peace & Faith"
                  subtitle="The Church of South India (C.S.I.)"
                  centered={false}
                />
                <div className="mt-8 space-y-6 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    All Saints' CSI Church, Thrissur, was established in 1842 by Rev. Henry Harley, the first CMS missionary to Thrissur. This historic church stands as a testament to faith and devotion in the heart of Kerala's cultural capital. Amidst Thrissur's rich heritage and ancient churches, All Saints' CSI Church remains a beacon of hope and spirituality. It has more than 450 families which are spread across an area of 25 kilometres in and around Thrissur. The various organizations of the Church such as Men's Fellowship, Women's Fellowship, Youth Fellowship, Sunday School, and Choir are doing many activities for the glorification of God's Kingdom.
                  </p>
                  <p>
                    In the second half of the 18th century, several European missionaries representing various missionary organizations began gospel work in India. In Kerala, three main missionary organizations were active: the C.M.S. (1816), L.M.S. (1806), and the Basel Mission (1834). These three followed different church traditions: the Basel Mission followed the Presbyterian tradition, the L.M.S. followed the Congregational tradition, and the C.M.S. followed the Anglican tradition. The churches they established continued these traditions. At the beginning of the 20th century, a realization grew that churches living and functioning in division were losing their Christian witness. Along with this, the influence of nationalism led to efforts toward creating an Indian Church. Missionaries gave a great call for unity.
                  </p>
                  <p className="font-semibold text-foreground/90">The journey to church unity:</p>
                </div>
                <div className="mt-6">
                  <Timeline items={csiHistoryTimeline} variant="compact" className="max-w-2xl" />
                </div>
                <div className="mt-6 font-sans text-muted-foreground leading-relaxed">
                  <p>This was the result of 28 years of prayer and discussion.</p>
                </div>
                <div className="mt-8">
                  <ChurchButton variant="primary" asLink href="/about">
                    Our Story
                  </ChurchButton>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="h-full">
              <div className="relative h-full min-h-[320px]">
                <div className="relative rounded-2xl overflow-hidden shadow-medium h-full min-h-[280px]">
                  <img
                    src={interiorImage}
                    alt="Church Interior"
                    className="w-full h-full min-h-[280px] object-cover object-center"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scripture quote — over Our Services */}
      <section className="bg-primary text-primary-foreground py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} aria-hidden />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <p className="text-lg sm:text-xl md:text-2xl font-serif italic max-w-3xl mx-auto text-primary-foreground">
            "God is Spirit, and those who worship Him must worship in spirit and truth."
          </p>
          <p className="font-sans text-sm mt-3 text-primary-foreground/90">— John 4:24</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-section-pattern">
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
        {/* Decorative: soft orbs + subtle grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(hsla(0,0%,100%,.15) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} aria-hidden />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-h2 text-primary-foreground italic leading-relaxed">
                "Come to me, all you who are weary and burdened, and I will give you rest."
              </p>
              <p className="text-body text-secondary mt-6">
                — Matthew 11:28
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-24 bg-section-soft">
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
