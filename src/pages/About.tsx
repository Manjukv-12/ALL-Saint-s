import { motion } from 'framer-motion';
import { Heart, Target, Eye, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';

import churchInterior from '@/assets/church-interior.jpg';
import stainedGlass from '@/assets/stained-glass.jpg';
import community from '@/assets/community.jpg';
import thambiPaulImage from '@/assets/leadership/thambi-paul.png';
import vicarImage from '@/assets/leadership/vicar.png';
import assistantVicarImage from '@/assets/leadership/assistant vicar.jpeg';
import treasurerImage from '@/assets/leadership/treasurer.jpeg';

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

  const leadership = [
    { name: 'Rev. Johnson E. George', role: 'Vicar', phone: '9495276958', image: vicarImage },
    { name: 'Rev. K.P. Johnson', role: 'Asst. Vicar', phone: '9446802261', image: assistantVicarImage },
    { name: 'Mr. Thambi Paul', role: 'Secretary', phone: '9446434216', image: thambiPaulImage },
    { name: 'Dr. David Saj Mathew', role: 'Treasurer', phone: '9847513132', image: treasurerImage },
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
                  History of All Saints’ CSI Church
                </h2>
                <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    When Henry Harley founded the church in 1842, he established it as a CMS (Church Missionary Society) church rooted in the Anglican tradition.
                  </p>
                  <p>
                    For exactly 105 years, All Saints’ CSI Church moved forward as an Anglican church. At that time, this church was part of the Thiru-Kochi Anglican Diocese. In 1947, when the Anglican Church joined with the Methodist Church and the S.I.U.C. to form the C.S.I. (Church of South India), this church became All Saints’ CSI Church and part of the C.S.I. North Kerala Diocese.
                  </p>
                  <p>
                    In 2015, when the North Kerala Diocese was divided to form the Malabar Diocese and the Cochin Diocese, All Saints’ CSI Church—which was the headquarters of the Cochin Mission—became part of the C.S.I. Cochin Diocese. Today, All Saints’ CSI Church is the most important and ancient church among the churches established by missionaries in the C.S.I. Cochin Diocese.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline: The Birth of All Saints’ CSI Church */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <h2 className="text-h2 text-foreground mb-10 text-center">
              Timeline: The Birth of All Saints’ CSI Church
            </h2>
          </ScrollReveal>
          <ul className="space-y-6 max-w-3xl mx-auto font-sans text-muted-foreground">
            <ScrollReveal delay={0.1}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">1816:</span>
                <span className="min-w-0"><strong className="text-foreground">The Mission Begins</strong> — The Church Missionary Society (CMS) officially enters the Malabar region, setting the stage for future gospel work in Central Kerala.</span>
              </li>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">1836:</span>
                <span className="min-w-0"><strong className="text-foreground">Thrissur as a Mission Hub</strong> — Missionaries, including Rev. Wood, identify Thrissur's strategic potential and establish it as a primary center for their operations.</span>
              </li>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">1840 (November 18):</span>
                <span className="min-w-0"><strong className="text-foreground">The Turning Point</strong> — Bishop T.G. Spencer of Madras visits. While an initial foundation had been laid near the Kaldaya Kurishupally (estimated at 600 rupees), objections lead to the search for a new, dedicated site.</span>
              </li>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">Late 1840:</span>
                <span className="min-w-0"><strong className="text-foreground">Land Acquisition</strong> — Rev. Henry Harley and Julius Christopher Kohlhoff successfully petition the government to acquire the extensive plot where the Church stands today.</span>
              </li>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">1841:</span>
                <span className="min-w-0"><strong className="text-foreground">The Building Phase</strong> — Rev. Henry Harley moves to Thrissur. Before the Church is finished, a school is built on-site to host the first worship services and baptisms.</span>
              </li>
            </ScrollReveal>
            <ScrollReveal delay={0.35}>
              <li className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <span className="font-semibold text-foreground shrink-0 sm:w-32">1841–1844:</span>
                <span className="min-w-0"><strong className="text-foreground">Completion</strong> — The Church is completed over a three-year period. The project is notable for the 50 candies of teak wood donated by the Maharaja of Cochin, signaling a unique bond between the Mission and the State.</span>
              </li>
            </ScrollReveal>
          </ul>
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

      {/* The Family Vault of the Kohlhoffs */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-h2 text-foreground mb-6">
                  The Family Vault of the Kohlhoffs
                </h2>
                <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                  <p>The Kohlhoff family is one that has made unique contributions to Indian missionary history, as well as political, social, and cultural history. This family was active in India for approximately 200 years.
                    The first missionary from this family was Johann Balthasar Kohlhoff. It was his son, John Caspar Kohlhoff, who baptized Vedamanickam, the first to become a Christian from Travancore. Some members of this family worked in the legal field, some in the Civil Service, some in the military, some in the plantation sector, and some in the medical field.
                    John Kohlhoff, the son of John Caspar Kohlhoff, was the Conservator of Forests for the King of Kochi. It was he who provided the necessary assistance to Henry Harley to move the Kochi Mission to Thrissur. Their family vault is situated near All Saints’ CSI Church. Rev. Henry Harley was his brother-in-law. Henry Harley's wife, Sophia Harley, is also buried here.
                    Architectural Details
                    The family vault of the Kohlhoffs has several unique features. One enters this vault through a door and descends 13 steps below the ground level. This vault is a room approximately 12 feet long and 12 feet wide. The upper part of the vault is beautifully constructed in an arch shape using laterite stones.
                    In this vault, the coffins containing the bodies are kept on stone platforms without being buried in the earth. It can be seen that three bodies are placed this way at a time. It is understood that the ancestors of the Kohlhoffs were from Germany. In this background, since a Jewish style is seen in the burial of the bodies, it is felt that it would be appropriate to investigate whether the Kohlhoffs belonged to the Jewish tradition.
                  </p>
                  <p>
                    Whether you're a longtime member or visiting for the first time, you'll find
                    a warm welcome and a place where you belong.
                  </p>
                </div>
                <div className="mt-8">
                  <ChurchButton variant="primary" asLink href="/contact">
                    Join Our Community
                  </ChurchButton>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={community}
                    alt="Church Community"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-secondary/30 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>
          </div>
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/20 text-secondary mb-6">
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

      {/* Leadership */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Church Leadership"
              subtitle="Meet the dedicated individuals who guide our congregation"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            {leadership.map((leader, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="w-44 h-44 mx-auto rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mb-3 ring-2 ring-border/50 shrink-0">
                    {leader.image ? (
                      <img
                        src={leader.image}
                        alt={leader.name}
                        className="w-full h-full object-contain object-center"
                      />
                    ) : (
                      <Users size={40} className="text-primary/50" />
                    )}
                  </div>
                  <h3 className="text-h4 text-foreground">
                    {leader.name}
                  </h3>
                  <p className="font-sans text-sm font-medium text-foreground mt-1">
                    {leader.role}
                  </p>
                  {leader.phone && (
                    <a
                      href={`tel:+91${leader.phone}`}
                      className="font-sans text-xs text-muted-foreground hover:text-primary mt-1 inline-block transition-colors"
                    >
                      {leader.phone}
                    </a>
                  )}
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
