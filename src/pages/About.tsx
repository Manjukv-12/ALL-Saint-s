import { motion } from 'framer-motion';
import { Heart, Target, Eye, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';
import ChurchButton from '@/components/common/ChurchButton';
import Timeline from '@/components/common/Timeline';

import churchInterior from '@/assets/church-interior.jpg';
import stainedGlass from '@/assets/stained-glass.jpg';

const About = () => {
  const values = [
    {
      icon: <Heart size={28} />,
      title: 'Love',
      description: 'Embracing all with the unconditional love of Christ, welcoming everyone as family.',
    },
    {
      icon: <Target size={28} />,
      title: 'Faith',
      description: 'Grounded in Scripture, trusting in God\'s plan for our lives and community.',
    },
    {
      icon: <Eye size={28} />,
      title: 'Service',
      description: 'Called to serve our community with humility, compassion, and dedication.',
    },
    {
      icon: <Users size={28} />,
      title: 'Unity',
      description: 'Building bridges across generations, cultures, and backgrounds in Christ.',
    },
  ];

  const timelineItems = [
    {
      date: '1816',
      title: 'The Mission Begins',
      description:
        'The Church Missionary Society (CMS) officially enters the Malabar region, setting the stage for future gospel work in Central Kerala.',
    },
    {
      date: '1836',
      title: 'Thrissur as a Mission Hub',
      description:
        "Missionaries, including Rev. Wood, identify Thrissur's strategic potential and establish it as a primary center for their operations.",
    },
    {
      date: '1840 (November 18)',
      title: 'The Turning Point',
      description:
        'Bishop T.G. Spencer of Madras visits. While an initial foundation had been laid near the Kaldaya Kurishupally (estimated at 600 rupees), objections lead to the search for a new, dedicated site.',
    },
    {
      date: 'Late 1840',
      title: 'Land Acquisition',
      description:
        'Rev. Henry Harley and Julius Christopher Kohlhoff successfully petition the government to acquire the extensive plot where the Church stands today.',
    },
    {
      date: '1841',
      title: 'The Building Phase',
      description:
        'Rev. Henry Harley moves to Thrissur. Before the Church is finished, a school is built on-site to host the first worship services and baptisms.',
    },
    {
      date: '1841–1844',
      title: 'Completion',
      description:
        'The Church is completed over a three-year period. The project is notable for the 50 candies of teak wood donated by the Maharaja of Cochin, signaling a unique bond between the Mission and the State.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={stainedGlass}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SectionTitle
              title="About Our Church"
              subtitle="Learn about our rich history, mission, and the community that makes us who we are"
              light
            />
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={churchInterior}
                    alt="Church Interior"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <h2 className="text-h2 text-foreground mb-6">
                  History of <ChurchName />
                </h2>
                <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    When Henry Harley founded the church in 1842, he established it as a CMS (Church Missionary Society) church rooted in the Anglican tradition.
                  </p>
                  <p>
                    For exactly 105 years, <ChurchName /> moved forward as an Anglican church. At that time, this church was part of the Thiru-Kochi Anglican Diocese. In 1947, when the Anglican Church joined with the Methodist Church and the S.I.U.C. to form the C.S.I. (Church of South India), this church became <ChurchName /> and part of the C.S.I. North Kerala Diocese.
                  </p>
                  <p>
                    In 2015, when the North Kerala Diocese was divided to form the Malabar Diocese and the Cochin Diocese, <ChurchName />—which was the headquarters of the Cochin Mission—became part of the C.S.I. Cochin Diocese. Today, <ChurchName /> is the most important and ancient church among the churches established by missionaries in the C.S.I. Cochin Diocese.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline: The Birth of All Saints' CSI Church */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <h2 className="text-h2 text-foreground mb-10 text-center">
              Timeline: The Birth of <ChurchName />
            </h2>
          </ScrollReveal>
          <Timeline items={timelineItems} variant="compact" />
        </div>
      </section>

      {/* Key Historical Figures & Contributions */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <h2 className="text-h2 text-foreground mb-10 text-center">
              Key Historical Figures &amp; Contributions
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="overflow-x-auto max-w-4xl mx-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-3 text-left font-serif font-semibold text-foreground">
                      Figure
                    </th>
                    <th className="border border-border px-4 py-3 text-left font-serif font-semibold text-foreground">
                      Role / Contribution
                    </th>
                  </tr>
                </thead>
                <tbody className="font-sans text-muted-foreground">
                  <tr>
                    <td className="border border-border px-4 py-3 font-medium text-foreground">Rev. Henry Harley</td>
                    <td className="border border-border px-4 py-3">Oversaw construction; conducted the first baptisms in the mission school.</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="border border-border px-4 py-3 font-medium text-foreground">Julius C. Kohlhoff</td>
                    <td className="border border-border px-4 py-3">Facilitated the acquisition of the current church land from the government.</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3 font-medium text-foreground">Bishop T.G. Spencer</td>
                    <td className="border border-border px-4 py-3">Provided the episcopal guidance and consent to relocate the church site.</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="border border-border px-4 py-3 font-medium text-foreground">Maharaja of Cochin</td>
                    <td className="border border-border px-4 py-3">Provided significant material support (teak wood) for the construction.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Mission & Vision"
              subtitle="Guided by faith, driven by love"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 h-full">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                  <Target size={28} />
                </div>
                <h3 className="text-h3 text-foreground mb-4">
                  Our Mission
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  To spread the love of Jesus Christ through worship, fellowship, and service.
                  We strive to nurture faith, build community, and extend God's grace to all
                  who enter our doors and beyond into the wider community of Thrissur.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 h-full">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                  <Eye size={28} />
                </div>
                <h3 className="text-h3 text-foreground mb-4">
                  Our Vision
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  To be a beacon of hope and faith in Thrissur, where people of all ages and
                  backgrounds can experience God's transformative love. We envision a vibrant
                  community that reflects Christ's teachings in every aspect of life.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Our Core Values"
              subtitle="The principles that guide our community"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-h3 text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
