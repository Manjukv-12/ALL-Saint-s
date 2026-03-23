import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import PhotoGallery from '@/components/common/PhotoGallery';
import VideoGallery from '@/components/common/VideoGallery';

import heroImg from '@/assets/08.jpeg';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SectionTitle
              title="Media Gallery"
              subtitle="Glimpses of our church, community, and celebrations"
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'photos'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'videos'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              Videos
            </button>
          </div>

          <ScrollReveal>
            {/* Keep both mounted so images stay cached when switching tabs */}
            <div className={activeTab === 'photos' ? 'block' : 'hidden'}>
              <PhotoGallery />
            </div>
            <div className={activeTab === 'videos' ? 'block' : 'hidden'}>
              <VideoGallery />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-h2 text-foreground italic leading-relaxed font-serif">
                "How lovely is your dwelling place, Lord Almighty! My soul yearns,
                even faints, for the courts of the Lord."
              </p>
              <p className="font-sans text-secondary mt-6 font-medium">
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
