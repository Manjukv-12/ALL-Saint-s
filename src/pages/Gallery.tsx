import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ImageGallery from '@/components/common/ImageGallery';

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
      src: img01,
      alt: 'Gallery Image 1',
      caption: 'Church Event',
      category: 'Community Events',
    },
    {
      src: img02,
      alt: 'Gallery Image 2',
      caption: 'Community Gathering',
      category: 'Community Events',
    },
    {
      src: img03,
      alt: 'Gallery Image 3',
      caption: 'Moments of Fellowship',
      category: 'Community Events',
    },
    {
      src: img04,
      alt: 'Gallery Image 4',
      caption: 'Celebration',
      category: 'Celebrations',
    },
    {
      src: img05,
      alt: 'Gallery Image 5',
      caption: 'Church Activities',
      category: 'Church Building',
    },
    {
      src: img06,
      alt: 'Gallery Image 6',
      caption: 'Special Occasion',
      category: 'Celebrations',
    },
    {
      src: img07,
      alt: 'Gallery Image 7',
      caption: 'Parish Event',
      category: 'Community Events',
    },
    {
      src: img08,
      alt: 'Gallery Image 8',
      caption: 'Worship Highlights',
      category: 'Worship Services',
    },
    {
      src: img09,
      alt: 'Gallery Image 9',
      caption: 'Community Joy',
      category: 'Community Events',
    },
    {
      src: img10,
      alt: 'Gallery Image 10',
      caption: 'Church Life',
      category: 'Community Events',
    },
    {
      src: img11,
      alt: 'Gallery Image 11',
      caption: 'Memorable Moments',
      category: 'Celebrations',
    },
    {
      src: img12,
      alt: 'Gallery Image 12',
      caption: 'Faith & fellowship',
      category: 'Worship Services',
    },
    {
      src: img13,
      alt: 'Gallery Image 13',
      caption: 'Gathering in Faith',
      category: 'Worship Services',
    },
    {
      src: img14,
      alt: 'Gallery Image 14',
      caption: 'Graceful Moments',
      category: 'Worship Services',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={img08} alt="" className="w-full h-full object-cover" />
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
              <p className="text-h2 text-foreground italic leading-relaxed">
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
    </Layout>
  );
};

export default Gallery;
