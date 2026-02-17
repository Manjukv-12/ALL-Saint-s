import { motion } from 'framer-motion';
import {
  Church, Heart, Users, BookOpen, Baby, Music,
  Cross, HandHeart, Clock
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ServiceCard from '@/components/common/ServiceCard';
import ChurchButton from '@/components/common/ChurchButton';

import stainedGlass from '@/assets/stained-glass.jpg';
import worship from '@/assets/worship.jpg';
import choir from '@/assets/choir.jpg';

const Services = () => {
  const worshipServices = [
    {
      icon: <Church size={28} />,
      title: 'Malayalam Holy Communion',
      time: 'Sunday 9:00 AM (1st, 2nd, 3rd & 4th)',
      description: 'Holy Communion in Malayalam on the first four Sundays of the month.',
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

  const ministries = [
    {
      icon: <BookOpen size={28} />,
      title: 'Sunday School',
      time: 'Sundays at 9:30 AM',
      description: 'Bible-based education for children aged 3-16, nurturing young hearts in faith.',
    },
    {
      icon: <Users size={28} />,
      title: 'Youth Fellowship',
      time: 'Saturdays at 5:00 PM',
      description: 'Dynamic programs for teens and young adults to explore faith and build friendships.',
    },
    {
      icon: <Users size={28} />,
      title: "Men's Fellowship",
      time: 'As announced',
      description: 'A gathering for men to grow in faith, build brotherhood, and serve together through prayer, study, and fellowship.',
    },
    {
      icon: <Users size={28} />,
      title: "Women's Fellowship",
      time: 'As announced',
      description: 'A gathering for women to grow in faith, build sisterhood, and serve together through prayer, study, and fellowship.',
    },
    {
      icon: <Music size={28} />,
      title: 'Choir Ministry',
      time: 'Practice: Saturdays',
      description: 'Lifting voices in praise, our choir leads worship and special musical programs.',
    },
  ];

  const sacraments = [
    {
      icon: <Baby size={28} />,
      title: 'Baptism',
      time: 'By Appointment',
      description: 'The sacrament of initiation into the Christian faith, celebrating new life in Christ.',
    },
    {
      icon: <Heart size={28} />,
      title: 'Holy Matrimony',
      time: 'By Appointment',
      description: 'Sacred celebration of marriage, uniting couples in Christian love and commitment.',
    },
    {
      icon: <Cross size={28} />,
      title: 'Holy Communion',
      time: 'First Sundays',
      description: 'The Lord\'s Supper, remembering Christ\'s sacrifice and receiving His grace.',
    },
    {
      icon: <HandHeart size={28} />,
      title: 'Confirmation',
      time: 'Annual Program',
      description: 'Strengthening faith through education and commitment to the church community.',
    },
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
              <ServiceCard key={index} {...service} index={index} />
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
                  src={worship}
                  alt="Worship Service"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground font-semibold mb-6">
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
                <div className="mt-8 flex items-center gap-4 p-4 bg-secondary/10 rounded-xl">
                  <Clock className="text-secondary flex-shrink-0" size={24} />
                  <div>
                    <p className="font-sans font-medium text-foreground">Service Times</p>
                    <p className="font-sans text-sm text-foreground">
                      Sunday: 9:00 AM Malayalam Holy Communion (1st, 2nd, 3rd & 4th) | 7:30 AM English Holy Communion (2nd & 4th) | 9:00 AM Malayalam Matins (5th). Friday: 10:30 AM Fasting Prayer
                    </p>
                  </div>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {ministries.map((ministry, index) => (
              <ServiceCard key={index} {...ministry} index={index} />
            ))}
          </div>
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
                <ChurchButton variant="hero" asLink href="/contact">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {sacraments.map((sacrament, index) => (
              <ServiceCard key={index} {...sacrament} index={index} />
            ))}
          </div>

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
