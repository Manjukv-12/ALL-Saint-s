import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchName from '@/components/common/ChurchName';

import stainedGlass from '@/assets/stained-glass.jpg';
import interiorImage from '@/assets/church-interior.jpg';

const History = () => {
  return (
    <Layout>
      {/* Hero Section — like About & Heritage */}
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
              title="Our History"
              subtitle={<>Church of South India & <ChurchName />, Thrissur</>}
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Main content — two-column like About & Heritage */}
      <section className="py-24 bg-background">
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
    </Layout>
  );
};

export default History;
