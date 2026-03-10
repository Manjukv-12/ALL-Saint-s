import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';

import stainedGlass from '@/assets/stained-glass.jpg';
import bishopImage from '@/assets/cochin Diocesean office bearers/Rt. Rev. Kurian Peter.jpeg';
import revJohnImage from '@/assets/cochin Diocesean office bearers/Clergy secretary Rev.John joseph.jpeg';
import revMammenImage from '@/assets/cochin Diocesean office bearers/Treasurer Rev.P.K.Mammen.jpeg';
import thambiPaulDioceseImage from '@/assets/cochin Diocesean office bearers/Laysecretary C.L.Thambi paul.jpeg';
import smithaMaryImage from '@/assets/cochin Diocesean office bearers/Smith Mary.jpeg';
import thambiPaulImage from '@/assets/leadership/thambi-paul.png';
import vicarImage from '@/assets/leadership/vicar.png';
import assistantVicarImage from '@/assets/leadership/assistant vicar.jpeg';
import treasurerImage from '@/assets/leadership/treasurer.jpeg';

import committeeJoy from '@/assets/WhatsApp Image 2026-03-01 at 9.17.57 PM (1).jpeg';
import committeeJohn from '@/assets/WhatsApp Image 2026-03-01 at 9.17.56 PM (1).jpeg';
import committeeSolomon from '@/assets/WhatsApp Image 2026-03-01 at 9.17.54 PM (1).jpeg';
import committeeSanil from '@/assets/WhatsApp Image 2026-03-01 at 9.17.55 PM.jpeg';
import committeeChintha from '@/assets/WhatsApp Image 2026-03-01 at 9.17.55 PM (1).jpeg';
import committeeShirly from '@/assets/WhatsApp Image 2026-03-01 at 9.17.54 PM.jpeg';
import committeeSumi from '@/assets/WhatsApp Image 2026-03-01 at 9.17.56 PM.jpeg';
import committeeRuncin from '@/assets/WhatsApp Image 2026-03-01 at 9.17.56 PM (2).jpeg';
import committeeAllen from '@/assets/WhatsApp Image 2026-03-01 at 9.17.53 PM (1).jpeg';
import committeeBenjamin from '@/assets/WhatsApp Image 2026-03-01 at 9.17.53 PM.jpeg';

// Other Members Imports
import memberAnnie from '@/assets/leadership/other members/Annie John.jpeg';
import memberJojy from '@/assets/leadership/other members/Mr. Jojy Koshy Varghese.jpeg';
import memberNikitha from '@/assets/leadership/other members/Nikitha .jpeg';
import memberReuben from '@/assets/leadership/other members/Reuben .jpeg';
import memberRonnie from '@/assets/leadership/other members/Ronnie.jpeg';
import memberSudha from '@/assets/leadership/other members/Sudha .jpeg';
import memberThomas from '@/assets/leadership/other members/Thomas.jpeg';
import memberCicil from '@/assets/leadership/other members/cicil.jpeg';
import memberSheela from '@/assets/leadership/other members/Sheela.jpeg';
import memberNewBeforeAnnie from '@/assets/WhatsApp Image 2026-03-04 at 9.14.28 AM.jpeg';

const leadership = [
  { name: 'Rev. Johnson E. George', role: 'Vicar', phone: '9495276958', image: vicarImage },
  { name: 'Rev. K.P. Johnson', role: 'Asst. Vicar', phone: '9446802261', image: assistantVicarImage },
  { name: 'Mr. Thambi Paul', role: 'Secretary', phone: '9446434216', image: thambiPaulImage },
  { name: 'Dr. David Saj Mathew', role: 'Treasurer', phone: '9847513132', image: treasurerImage },
];

const committeeMembers = [
  { name: 'Joy Williams C', image: committeeJoy },
  { name: 'John Ralf', image: committeeJohn },
  { name: 'Solomon Xavier', image: committeeSolomon },
  { name: 'Prof. Dr. Sanil Raj J', image: committeeSanil },
  { name: 'Chintha Mani', image: committeeChintha },
  { name: 'Shirly Christopher', image: committeeShirly },
  { name: 'Sumi Ajit', image: committeeSumi },
  { name: 'Adv. Runcin Majosh Joseph', image: committeeRuncin },
  { name: 'Allen P. Sabu', image: committeeAllen },
  { name: 'Benjamin Thomas', image: committeeBenjamin },
];

const otherMembers = [
  {
    name: 'Cicil Silvester',
    role: 'Office Clerk',
    phone: '6282303477',
    image: memberCicil
  },
  {
    name: 'Sonal Peter',
    role: 'Sexton',
    phone: '8301056914',
    image: null
  },
  {
    name: 'Joji Koshy Varghese',
    role: 'Choir Secretary',
    phone: '9349701457',
    image: memberJojy
  },
  {
    name: 'Reuben Thomas',
    role: 'Choir Master',
    phone: '9447646895',
    image: memberReuben
  },
  {
    name: 'Sheela Sam',
    role: 'SS Superintendent',
    phone: '9446509796',
    image: memberSheela
  },
  {
    name: 'Ronnie T. Roy',
    role: 'YF Secretary',
    phone: '6235259562',
    image: memberRonnie
  },
  {
    name: 'Nikitha E Mathew',
    role: 'YF Secretary',
    phone: '9562247979',
    image: memberNikitha
  },
  {
    name: 'Sudha Johnson',
    role: 'WF President',
    phone: undefined,
    image: memberNewBeforeAnnie
  },
  {
    name: 'Annie John',
    role: 'WF Secretary',
    phone: '7736742447',
    image: memberAnnie
  },
  {
    name: 'Thomas Mani',
    role: 'MF Secretary',
    phone: '9447527371',
    image: memberThomas
  },
];

const Leadership = () => {
  return (
    <Layout>
      <div className="w-full min-w-0 overflow-x-hidden">
        {/* Hero */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={stainedGlass} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <SectionTitle
                title="Our Leadership Team"
                subtitle="Meet the dedicated individuals who guide our congregation"
                light
              />
            </motion.div>
          </div>
        </section>

        {/* Our Bishop */}
        <section className="py-14 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <ScrollReveal direction="left">
                <div className="relative rounded-2xl overflow-hidden shadow-medium max-w-sm mx-auto lg:mx-0">
                  <img
                    src={bishopImage}
                    alt="Rt. Rev. Kurian Peter"
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.2}>
                <div>
                  <h2 className="text-h2 text-foreground mb-6">Our Bishop</h2>
                  <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                    <p>
                      <span className="font-semibold text-foreground">Rt. Rev. Kurian Peter</span> has made significant contributions to the Church of South India (CSI) and the Cochin Diocese. As the current Bishop of Cochin, he has been instrumental in promoting spiritual growth and community development.
                    </p>
                    <p className="font-semibold text-foreground mt-6">Some of his notable contributions include:</p>
                    <ul className="space-y-4 mt-4">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p>
                          <span className="font-semibold text-foreground">Leadership:</span> He was consecrated as the Bishop of Cochin Diocese on August 15, 2025, and has been leading the diocese with dedication and commitment.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p>
                          <span className="font-semibold text-foreground">Pastoral Care:</span> He has served as Director of Counseling Centers and has worked extensively in pastoral care, demonstrating his compassion and empathy for the community.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p>
                          <span className="font-semibold text-foreground">Education:</span> He has earned a Master of Theology in Pastoral Care from Trinity College, University of Divinity, Melbourne, and has been involved in Christian education, serving as Director of Christian Education.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p>
                          <span className="font-semibold text-foreground">Community Service:</span> He has worked with various organizations, including AgeCare in Melbourne, and has been involved in missionary work, demonstrating his commitment to serving the community.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Cochin Diocesan Office Bearers */}
        <section className="py-14 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <SectionTitle
                title="Cochin Diocesan Office Bearers"
                subtitle="Leaders serving the wider Cochin Diocese"
              />
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-5xl mx-auto w-full min-w-0">
              {[
                { name: 'Rev. John Joseph', image: revJohnImage },
                { name: 'Rev. P. K. Mammen', image: revMammenImage },
                { name: 'C. L. Thambi Paul', image: thambiPaulDioceseImage },
                { name: 'Smitha Mary Mathew', image: smithaMaryImage },
              ].map((leader, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center min-w-0">
                    <div className="w-28 h-28 sm:w-44 sm:h-44 mx-auto rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 ring-2 ring-border/50 shrink-0 shadow-soft">
                      {leader.image ? (
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <Users size={40} className="text-primary/50" />
                      )}
                    </div>
                    <h3 className="text-sm sm:text-h4 text-foreground break-words mt-4">{leader.name}</h3>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Church Committee */}
        <section className="py-14 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <SectionTitle
                title="Church Committee"
                subtitle="Governance and ministry within the Church of South India"
              />
            </ScrollReveal>
            <div className="mt-10 max-w-3xl mx-auto font-sans text-body text-muted-foreground space-y-6">
              <p>
                The Church Committee is called to exercise their ministry within the Church of South India, accepting the disciplines and constitution of the Church, Diocese and the Church of South India, by submitting themselves and keeping the sanctity of their ministry by strengthening Christian fellowship and being a sincere helping hand to the minister.
              </p>
              <p>
                The Vicar, appointed by the Bishop is the head of the congregation and the President (ex-officio) of the Church Committee. The General Body comprises of all members whose names are enlisted in the Church Register. The Church Committee functions as the executive of the General Body and manages all affairs of the Parish subject to the provisions of the Constitution of the CSI Parish (Malayalam) Dubai. The Church Committee's responsibilities include assisting the Vicar in efficient and smooth running of the Parish, safeguarding of funds and properties, maintaining proper records, arranging General Body meetings and implementing decisions thereof.
              </p>
              <p>
                The Vice-President, Church Wardens and all Other Committee Members are elected by the General Body. The Church Committee, at its first meeting after the election, elects two of its members as Secretary and Treasurer respectively.
              </p>
              <p>
                The General Body elects an Internal Auditor who is independent from the Church Committee. The Church Committee is authorised by the General Body to appoint the External Auditor.
              </p>
            </div>
          </div>
        </section>

        {/* Full group photo placeholder — above Church Leadership */}
        <section className="py-10 sm:py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto w-full">
                <div className="aspect-[2/1] min-h-[200px] sm:min-h-[280px] rounded-xl sm:rounded-2xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center">
                  <p className="font-sans text-muted-foreground text-center px-4 flex flex-col items-center gap-2">
                    <Users size={48} className="text-muted-foreground/60" />
                    <span className="font-medium">Full group photo of committee members</span>
                    <span className="text-sm">Add your group photo here</span>
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Church Leadership */}
        <section className="py-14 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <SectionTitle
                title="Church Leadership"
                subtitle="Meet the dedicated individuals who guide our congregation"
              />
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto w-full min-w-0">
              {leadership.map((leader, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center min-w-0">
                    <div className="w-28 h-28 sm:w-44 sm:h-44 mx-auto rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 ring-2 ring-border/50 shrink-0">
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
                    <h3 className="text-sm sm:text-h4 text-foreground break-words">{leader.name}</h3>
                    <p className="font-sans text-xs sm:text-sm font-medium text-foreground mt-0.5 sm:mt-1">{leader.role}</p>
                    {leader.phone && (
                      <a
                        href={`tel:+91${leader.phone}`}
                        className="font-sans text-xs text-muted-foreground hover:text-primary mt-0.5 sm:mt-1 inline-block transition-colors"
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

        {/* Pastorate Committee Members — refined card layout */}
        <section className="py-14 sm:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <SectionTitle
                title="Pastorate Committee Members"
                subtitle="Elected members serving under the leadership team"
              />
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-16 max-w-6xl mx-auto w-full min-w-0">
              {committeeMembers.map((member, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <div className="group bg-card border border-border/80 rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-8 text-center h-full flex flex-col items-center transition-all duration-300 hover:shadow-medium hover:border-primary/20 hover:-translate-y-1 min-w-0">
                    <div className="w-full max-w-[140px] sm:max-w-[200px] aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-muted/80 flex items-center justify-center mb-3 sm:mb-6 shrink-0 border border-border/50 shadow-inner">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="inline-block w-6 sm:w-8 h-0.5 bg-primary/30 rounded-full mb-2 sm:mb-4" aria-hidden />
                    <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-[0.2em] text-muted-foreground mb-1 sm:mb-2">
                      Committee Member
                    </p>
                    <h3 className="text-sm sm:text-lg font-sans font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 break-words line-clamp-2">
                      {member.name}
                    </h3>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Other Members */}
        <section className="py-14 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <ScrollReveal>
              <SectionTitle
                title="Other Members"
                subtitle="Valued members of our church community"
              />
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 mt-8 sm:mt-12 max-w-5xl mx-auto w-full min-w-0">
              {otherMembers.map((member, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <div className="group bg-card border border-border/80 rounded-lg sm:rounded-xl shadow-soft p-3 sm:p-5 text-center h-full flex flex-col items-center transition-all duration-300 hover:shadow-medium hover:border-primary/20 hover:-translate-y-0.5 min-w-0">
                    <div className="w-full max-w-[90px] sm:max-w-[120px] lg:max-w-[140px] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden bg-muted/80 flex items-center justify-center mb-2 sm:mb-3 shrink-0 border border-border/50 shadow-inner">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <Users size={40} className="text-primary/20" />
                      )}
                    </div>
                    <span className="inline-block w-5 sm:w-6 h-0.5 bg-primary/30 rounded-full mb-1.5 sm:mb-2" aria-hidden />
                    <p className="font-sans text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                      {member.role}
                    </p>
                    <h3 className="text-xs sm:text-sm font-sans font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 break-words line-clamp-2">
                      {member.name}
                    </h3>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="font-sans text-[10px] sm:text-xs text-muted-foreground hover:text-primary mt-0.5 sm:mt-1 inline-block transition-colors"
                      >
                        {member.phone}
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Leadership;
