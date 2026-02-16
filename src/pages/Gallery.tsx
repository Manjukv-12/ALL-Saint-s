import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ImageGallery from '@/components/common/ImageGallery';

import stainedGlass from '@/assets/stained-glass.jpg';
import heroChurch from '@/assets/hero-church.jpg';
import churchInterior from '@/assets/church-interior.jpg';
import worship from '@/assets/worship.jpg';
import community from '@/assets/community.jpg';
import choir from '@/assets/choir.jpg';
import img01 from '@/assets/01.jpeg';
import img02 from '@/assets/02.jpeg';
import img03 from '@/assets/03.jpeg';
import img04 from '@/assets/04.jpeg';
import img05 from '@/assets/05.jpeg';
import img06 from '@/assets/06.jpeg';
import img07 from '@/assets/07.jpeg';
import img08 from '@/assets/08.jpeg';
import img09 from '@/assets/09.jpeg';
import img10 from '@/assets/010.jpg';
import img11 from '@/assets/011.jpeg';
import img12 from '@/assets/012.jpg';
import img13 from '@/assets/013.jpeg';
import img14 from '@/assets/014.jpeg';

const Gallery = () => {
  const galleryImages = [
    {
      src: heroChurch,
      alt: 'CSI AllSaints church Thrissur Exterior',
      caption: 'Our beautiful church building at sunset',
    },
    {
      src: churchInterior,
      alt: 'Church Interior',
      caption: 'The sacred sanctuary filled with golden light',
    },
    {
      src: stainedGlass,
      alt: 'Stained Glass Window',
      caption: 'Historic stained glass depicting the Cross',
    },
    {
      src: worship,
      alt: 'Sunday Worship Service',
      caption: 'Our congregation gathered in worship',
    },
    {
      src: community,
      alt: 'Community Fellowship',
      caption: 'Fellowship and community gathering',
    },
    {
      src: choir,
      alt: 'Church Choir',
      caption: 'Our choir leading worship in song',
    },
    {
      src: heroChurch,
      alt: 'Church at Dawn',
      caption: 'Morning light gracing our church',
    },
    {
      src: churchInterior,
      alt: 'Altar View',
      caption: 'View of the holy altar',
    },
    {
      src: worship,
      alt: 'Special Service',
      caption: 'Special celebration service',
    },
    {
      src: img01,
      alt: 'Gallery Image 1',
      caption: 'Church Event',
    },
    {
      src: img02,
      alt: 'Gallery Image 2',
      caption: 'Community Gathering',
    },
    {
      src: img03,
      alt: 'Gallery Image 3',
      caption: 'Moments of Fellowship',
    },
    {
      src: img04,
      alt: 'Gallery Image 4',
      caption: 'Celebration',
    },
    {
      src: img05,
      alt: 'Gallery Image 5',
      caption: 'Church Activities',
    },
    {
      src: img06,
      alt: 'Gallery Image 6',
      caption: 'Special Occasion',
    },
    {
      src: img07,
      alt: 'Gallery Image 7',
      caption: 'Parish Event',
    },
    {
      src: img08,
      alt: 'Gallery Image 8',
      caption: 'Worship Highlights',
    },
    {
      src: img09,
      alt: 'Gallery Image 9',
      caption: 'Community Joy',
    },
    {
      src: img10,
      alt: 'Gallery Image 10',
      caption: 'Church Life',
    },
    {
      src: img11,
      alt: 'Gallery Image 11',
      caption: 'Memorable Moments',
    },
    {
      src: img12,
      alt: 'Gallery Image 12',
      caption: 'Faith & fellowship',
    },
    {
      src: img13,
      alt: 'Gallery Image 13',
      caption: 'Gathering in Faith',
    },
    {
      src: img14,
      alt: 'Gallery Image 14',
      caption: 'Graceful Moments',
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
              title="Photo Gallery"
              subtitle="Glimpses of our church, community, and celebrations"
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <ImageGallery images={galleryImages} />
          </ScrollReveal>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-serif text-2xl md:text-3xl text-foreground italic leading-relaxed">
                "How lovely is your dwelling place, Lord Almighty! My soul yearns,
                even faints, for the courts of the Lord."
              </p>
              <p className="font-sans text-secondary mt-6">
                — Psalm 84:1-2
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <SectionTitle
              title="Explore Our Memories"
              subtitle="Browse through different aspects of our church life"
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { name: 'Church Building', count: '12 photos' },
              { name: 'Worship Services', count: '24 photos' },
              { name: 'Community Events', count: '18 photos' },
              { name: 'Celebrations', count: '30 photos' },
            ].map((category, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="group bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center cursor-pointer hover:shadow-medium transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <span className="font-serif text-2xl font-semibold text-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground">
                    {category.count}
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

export default Gallery;
