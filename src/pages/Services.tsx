import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { LucideIconByName } from '@/components/common/LucideIconByName';
import { SERVICES_CONTENT } from '@/lib/siteContent';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ServiceCard from '@/components/common/ServiceCard';
import ChurchButton from '@/components/common/ChurchButton';
import Carousel from '@/components/common/Carousel';

import stainedGlass from '@/assets/stained-glass.jpg';
import churchImage from '@/assets/churchimage.png';
import choir from '@/assets/choir.jpg';

const Services = () => {
  const { worshipServices, ministries, sacraments } = SERVICES_CONTENT;

  const toCardProps = (s: (typeof worshipServices)[0]) => ({
    title: s.title,
    time: s.time,
    description: s.description,
    imageUrl: s.imageUrl,
    icon: <LucideIconByName name={s.icon} size={28} />,
  });

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
              title="Our Services"
              subtitle="Join us in worship, fellowship, and spiritual growth throughout the week"
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Worship Services */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Worship Services"
              subtitle="Experience the joy of collective worship"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {worshipServices.map((service, index) => (
              <ServiceCard key={index} {...toCardProps(service)} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Worship Image Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative rounded-2xl overflow-hidden shadow-medium">
                <img
                  src={churchImage}
                  alt="Worship Service"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <h2 className="text-h2 text-foreground mb-6">
                  Come As You Are
                </h2>
                <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    Our worship services are designed to create a sacred space where you can
                    encounter God's presence, find peace, and connect with a loving community.
                  </p>
                  <p>
                    Whether you prefer the quiet reverence of our early morning service or
                    the vibrant gathering of our main service, there's a place for you here.
                  </p>
                  <p>
                    All are welcome — members, visitors, seekers, and friends. Come as you are
                    and experience the transformative power of worship.
                  </p>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Ministries & Programs"
              subtitle="Opportunities for growth, learning, and service"
            />
          </ScrollReveal>

          <Carousel
            className="mt-16"
            autoplay={true}
            autoplayDelay={3000}
            options={{ loop: true, align: 'center' }}
          >
            {ministries.map((ministry, index) => (
              <ServiceCard key={index} {...toCardProps(ministry)} index={index} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* Choir Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={choir} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-primary/80" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <SectionTitle
                title="Lift Your Voice in Praise"
                subtitle="Our choir ministry welcomes singers of all skill levels"
                light
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-sans text-primary-foreground/80 leading-relaxed mt-6"
              >
                Music is an integral part of our worship experience. Our church choir leads
                the congregation in praise and performs special anthems during services and
                festivals. Whether you're an experienced vocalist or simply love to sing,
                we invite you to join our choir family.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <ChurchButton variant="hero" asLink href="/choir-registration">
                  Join the Choir
                </ChurchButton>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sacraments */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Sacraments"
              subtitle="Sacred rites that mark significant moments in our spiritual journey"
            />
          </ScrollReveal>

          <Carousel
            className="mt-16"
            mode="perspective"
            options={{ loop: true, align: 'start', dragFree: false }}
            showDots={true}
            slidesPerViewLg={2}
          >
            {sacraments.map((sacrament, index) => (
              <ServiceCard key={index} {...toCardProps(sacrament)} index={index} />
            ))}
          </Carousel>

          <ScrollReveal delay={0.3}>
            <div className="max-w-2xl mx-auto text-center mt-12">
              <p className="font-sans text-muted-foreground mb-6">
                For inquiries about sacraments or to schedule an appointment,
                please contact the church office.
              </p>
              <ChurchButton variant="outline" asLink href="/contact">
                Contact Us
              </ChurchButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
