import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';
import Timeline from '@/components/common/Timeline';

import stainedGlass from '@/assets/stained-glass.jpg';
import community from '@/assets/community.jpg';
import interiorImage from '@/assets/church-interior.jpg';

const csiHistoryTimeline = [
  { date: '1901', title: 'Presbyterian churches unite', description: 'Presbyterian churches joined together as one church.' },
  { date: '1906', title: 'Congregational churches unite', description: 'Congregational churches joined together as one church.' },
  { date: '1908', title: 'S.I.U.C. formed', description: 'Congregational and Presbyterian churches joined to form the S.I.U.C. (South India United Church).' },
  { date: '1919', title: 'Tranquebar call for unity', description: 'At a meeting held in Tranquebar (Tharangampadi) led by Bishop V.S. Azariah, Christian workers issued an invitation for church unity.' },
  { date: '1919', title: 'S.I.U.C. and Anglican discussions', description: 'Discussions began between the S.I.U.C. and the Anglican Church.' },
  { date: '1925', title: 'Methodist Church joins', description: 'The Methodist Church joined the discussions.' },
  { date: '1947', title: 'Church of South India', description: 'These three churches became one. For the first time in history, Episcopal and Non-Episcopal churches joined to form the C.S.I. The ceremonies took place at St. George Cathedral, Madras, and the inauguration was on September 27, 1947.' },
];

const Heritage = () => {
  return (
    <Layout>
      {/* Hero Section — like About */}
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
              title="Heritage"
              subtitle={<>The journey to church unity and the legacy of the Kohlhoff family at <ChurchName /></>}
              light
            />
          </motion.div>
        </div>
      </section>

      {/* A Heritage of Hope — from History.tsx */}
      <section className="py-24 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={interiorImage}
                    alt="Church Interior — All Saints' CSI Church, Thrissur"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <SectionTitle
                  title="A Heritage of Hope in Thrissur's Heartland"
                  subtitle="Church of South India (C.S.I.)"
                  centered={false}
                />
                <div className="space-y-5 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    The Church of South India is a shining example of ecclesiastical unity. Its diverse traditions and inclusive spirit make it a truly remarkable institution, inspiring unity and devotion.
                  </p>
                  <p>
                    Established on September 27, 1947, the Church of South India is a beacon of unity and hope, bringing together diverse Christian traditions under one roof. This remarkable union of Anglican, Methodist, Congregational, Presbyterian, and Reformed churches is a testament to the power of faith and cooperation.
                  </p>
                  <p>
                    The journey towards unity began in 1919 at Tranquebar (now Tarangambadi), and after years of negotiations, the Church of South India was born. Today, it spans across 24 dioceses in 5 South Indian states and Jaffna (Sri Lanka), with each diocese guided by a devoted Bishop.
                  </p>
                  <h3 className="text-h3 text-foreground font-semibold pt-2">Governance and Beliefs</h3>
                  <p>
                    The Church is governed by the Synod, which elects a Moderator (presiding Bishop) every 3 years. This unique blend of episcopal, Presbyterian, and Congregational elements ensures a balanced and inclusive approach to faith. The Scripture is the ultimate standard, and the historic Creeds are revered as interpretations of Biblical faith. The sacraments of Baptism and the Lord's Supper are sacred and binding.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The journey to church unity */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="The Journey to Church Unity"
              subtitle="From divided traditions to one Church of South India"
              centered
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-12 max-w-4xl mx-auto">
              <Timeline items={csiHistoryTimeline} variant="compact" className="w-full max-w-none" />
            </div>
            <p className="mt-10 font-sans text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
              This was the result of 28 years of prayer and discussion.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The Family Vault of the Kohlhoffs — two-column like About History */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-medium">
                  <img
                    src={community}
                    alt="Church Community"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/20 rounded-2xl -z-10" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div>
                <SectionTitle
                  title="The Family Vault of the Kohlhoffs"
                  subtitle="A unique chapter in Indian missionary and cultural history"
                  centered={false}
                />
                <div className="space-y-5 font-sans text-muted-foreground leading-relaxed">
                  <p>
                    The Kohlhoff family is one that has made unique contributions to Indian missionary history, as well as political, social, and cultural history. This family was active in India for approximately 200 years. The first missionary from this family was Johann Balthasar Kohlhoff. It was his son, John Caspar Kohlhoff, who baptized Vedamanickam, the first to become a Christian from Travancore. Some members of this family worked in the legal field, some in the Civil Service, some in the military, some in the plantation sector, and some in the medical field. John Kohlhoff, the son of John Caspar Kohlhoff, was the Conservator of Forests for the King of Kochi. It was he who provided the necessary assistance to Henry Harley to move the Kochi Mission to Thrissur. Their family vault is situated near <ChurchName />. Rev. Henry Harley was his brother-in-law. Henry Harley's wife, Sophia Harley, is also buried here.
                  </p>
                  <h3 className="text-h3 text-foreground font-semibold pt-2">Architectural Details</h3>
                  <p>
                    The family vault of the Kohlhoffs has several unique features. One enters this vault through a door and descends 13 steps below the ground level. This vault is a room approximately 12 feet long and 12 feet wide. The upper part of the vault is beautifully constructed in an arch shape using laterite stones. In this vault, the coffins containing the bodies are kept on stone platforms without being buried in the earth. It can be seen that three bodies are placed this way at a time. It is understood that the ancestors of the Kohlhoffs were from Germany. In this background, since a Jewish style is seen in the burial of the bodies, it is felt that it would be appropriate to investigate whether the Kohlhoffs belonged to the Jewish tradition.
                  </p>
                  <p>
                    Whether you're a longtime member or visiting for the first time, you'll find a warm welcome and a place where you belong.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Heritage;
