import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Calendar, ArrowRight, Loader2, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { LucideIconByName } from '@/components/common/LucideIconByName';
import { SERVICES_CONTENT } from '@/lib/siteContent';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';
import ChurchButton from '@/components/common/ChurchButton';
import ServiceCard from '@/components/common/ServiceCard';
import Carousel from '@/components/common/Carousel';

import heroVideoV1 from '@/assets/video/csichurch_v1.mp4';
import churchExterior from '@/assets/013.jpeg';
import sanctusVoix2026 from '@/assets/sanctus-voix-2026-poster.png';
import interiorImage from '@/assets/church-interior.jpg';
import churchExteriorPath from '@/assets/011.jpeg';
import bethelAshram from '@/assets/bethel-ashram-thrissur.png';
import HeroSlider from '@/components/common/HeroSlider';

const Index = () => {
  const heroVideoV1Ref = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [posterLightboxOpen, setPosterLightboxOpen] = useState(false);
  const homeServices = SERVICES_CONTENT.homeTeasers;

  const handleHeroSlideChange = (index: number) => {
    const video = heroVideoV1Ref.current;
    if (index === 0) video?.play().catch(() => {});
    else video?.pause();
  };

  return (
    <Layout>
      {/* Hero slider: (1) Video with loading, (2) Sanctus Voix 2026 + Choir Registration, (3) Church image */}
      <section className="relative pt-14 sm:pt-16 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden bg-black">
        <HeroSlider
          autoplay
          autoplayDelays={[22000, 15000, 15000]}
          onSlideChange={handleHeroSlideChange}
          className="h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]"
        >
          {/* Slide 1: Video (with loading state) */}
          <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[11]">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary-foreground animate-spin" aria-hidden />
                  <span className="text-primary-foreground/90 text-sm">Loading video...</span>
                </div>
              </div>
            )}
            <video
              ref={heroVideoV1Ref}
              autoPlay={false}
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover object-center"
              aria-hidden
              onCanPlay={() => setVideoLoaded(true)}
              onLoadedData={() => setVideoLoaded(true)}
            >
              <source src={heroVideoV1} type="video/mp4" />
            </video>
            <div className="absolute inset-0 flex items-center justify-center text-center z-10">
              <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-h1 text-hero-title mb-6 hero-text-shadow">
                  <ChurchName variant="csidot" as="span" />
                </h1>
                <p className="text-h2 text-hero-subtitle italic mb-10 hero-text-shadow">
                  Thrissur, Kerala
                </p>
                <div className="flex justify-center">
                  <ChurchButton variant="primary" size="lg" asLink href="/services">
                    Join Our Services
                  </ChurchButton>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Sanctus Voix 2026 */}
          <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-black/90">
            <button
              type="button"
              className="absolute inset-0 w-full h-full z-[1] cursor-zoom-in focus:outline-none focus:ring-0"
              onClick={() => setPosterLightboxOpen(true)}
              aria-label="View full poster"
            >
              <img
                src={sanctusVoix2026}
                alt="Sanctus Voix 2026 - Online International Choir Competition"
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              />
            </button>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10" onClick={(e) => e.stopPropagation()}>
              <ChurchButton variant="primary" size="lg" asLink href="/choir-registration">
                Sanctus Voix
              </ChurchButton>
            </div>
          </div>

          {/* Slide 3: Church exterior (original first image) */}
          <div className="relative w-full h-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
            <img
              src={churchExterior}
              alt="CSI All Saints Church"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 flex items-center justify-center text-center z-10">
              <div className="container mx-auto px-4 max-w-4xl">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-h1 font-old-english text-hero-title mb-6 hero-text-shadow"
                >
                  <ChurchName variant="csidot" />
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
                  <ChurchButton variant="primary" size="lg" asLink href="/services">
                    Join Our Services
                  </ChurchButton>
                </motion.div>
              </div>
            </div>
          </div>
        </HeroSlider>

        {/* Poster full-screen lightbox: tap image on slide 2 to open, close button or tap outside to close */}
        {posterLightboxOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPosterLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Sanctus Voix 2026 poster"
          >
            <button
              type="button"
              className="absolute top-4 right-4 z-[101] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setPosterLightboxOpen(false)}
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <img
              src={sanctusVoix2026}
              alt="Sanctus Voix 2026 - Online International Choir Competition"
              className="max-w-full max-h-[calc(100vh-2rem)] w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </section>

      {/* Welcome Section */}
      <section className="py-14 sm:py-16 lg:py-20 bg-section-tint">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Top row: text left, image right */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            <ScrollReveal direction="left">
              <div className="flex flex-col">
                <SectionTitle
                  title="A Place of Peace & Faith"
                  subtitle={<ChurchName />}
                  centered={false}
                />
                <div className="mt-6 space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    <ChurchName />, Thrissur, was established in 1842 by Rev. Henry Harley, the first CMS missionary to Thrissur. This historic church stands as a testament to faith and devotion in the heart of Kerala's cultural capital. Amidst Thrissur's rich heritage and ancient churches, <ChurchName /> remains a beacon of hope and spirituality. It has more than 450 families which are spread across an area of 25 kilometres in and around Thrissur. The various organizations of the Church such as Men's Fellowship, Women's Fellowship, Youth Fellowship, Sunday School, and Choir are doing many activities for the glorification of God's Kingdom.
                  </p>
                </div>
                <div className="mt-6">
                  <ChurchButton variant="primary" asLink href="/about">
                    Our Story
                  </ChurchButton>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="h-full">
              <div className="relative h-full flex items-center justify-center">
                <div className="relative rounded-2xl overflow-hidden shadow-medium w-full">
                  <img
                    src={churchExteriorPath}
                    alt="All Saints' CSI Church, Thrissur — Church of South India"
                    className="w-full h-auto object-contain rounded-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Heritage section — image left, content right */}
      <section className="py-14 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-medium w-full">
                <img
                  src={interiorImage}
                  alt="Church Interior"
                  className="w-full h-auto object-contain rounded-2xl"
                />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="order-1 lg:order-2">
              <div className="flex flex-col justify-start">
                <SectionTitle
                  title="A Heritage of Hope in Thrissur's Heartland"
                  subtitle="Church of South India (C.S.I.)"
                  centered={false}
                />
                <div className="mt-4 space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    The Church of South India is a shining example of ecclesiastical unity. Its diverse traditions and inclusive spirit make it a truly remarkable institution, inspiring unity and devotion.

                    Established on September 27, 1947, the Church of South India is a beacon of unity and hope, bringing together diverse Christian traditions under one roof. This remarkable union of Anglican, Methodist, Congregational, Presbyterian, and Reformed churches is a testament to the power of faith and cooperation.

                    The journey towards unity began in 1919 at Tranquebar (now Tarangambadi), and after years of negotiations, the Church of South India was born. Today, it spans across 24 dioceses in 5 South Indian states and Jaffna (Sri Lanka), with each diocese guided by a devoted Bishop.
                  </p>
                </div>
                <div className="mt-6">
                  <ChurchButton variant="primary" asLink href="/heritage">
                    Our Heritage
                  </ChurchButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Bethel Ashram, Thrissur — text left, photo right */}
      <section className="py-14 sm:py-16 lg:py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-h2 text-foreground mb-2">
                  Bethel Ashram, Thrissur
                </h2>
                <p className="text-lg font-sans text-primary font-medium mb-6">
                  Discover the Spiritual Haven
                </p>
                <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    Located in the heart of Thrissur, Kerala&apos;s cultural capital, Bethel Ashram stands tall as a beacon of hope and solace. This revered institution has been serving the destitute and providing opportunities for education and employment since its inception on January 6, 1934.
                  </p>
                  <p>
                    Guided by the motto &quot;As seeing Him who is invisible,&quot; we strive to make a difference in the lives of those around us. Our core values of Sacrifice, Humility, and Sincerity drive us to provide food, shelter, and support to those in need.
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="font-sans font-semibold text-foreground mb-3">We Offer</h3>
                  <ul className="space-y-2 font-sans text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Food and shelter for the destitute
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Opportunities for education and employment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Spiritual guidance and support
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={bethelAshram}
                    alt="Bethel Ashram, Thrissur - a traditional building surrounded by greenery"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scripture quote — over Our Services */}
      <section className="bg-primary text-primary-foreground py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} aria-hidden />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-h2 text-primary-foreground italic leading-relaxed">
              "God is Spirit, and those who worship Him must worship in spirit and truth."
            </p>
            <p className="text-body text-secondary mt-6">
              — John 4:24
            </p>
          </div>
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
            {homeServices.map((service, index) => (
              <ServiceCard
                key={index}
                icon={<LucideIconByName name={service.icon} size={28} />}
                title={service.title}
                time={service.time}
                description={service.description}
                imageUrl={service.imageUrl}
                index={index}
              />
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
