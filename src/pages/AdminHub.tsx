import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import { Calendar, Users } from 'lucide-react';
import stainedGlass from '@/assets/stained-glass.jpg';

/**
 * No password here — each tool uses the PHP admin API key on its own page.
 */
const AdminHub = () => (
  <Layout>
    <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src={stainedGlass} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <SectionTitle
            title="Staff tools"
            subtitle="Open the area you need. You will enter the admin API key on that page (same as config.php)."
            light
          />
        </motion.div>
      </div>
    </section>

    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="max-w-md mx-auto flex flex-col gap-4">
            <ChurchButton
              variant="primary"
              size="lg"
              className="w-full justify-center"
              asLink
              href="/admin/choir-registrations"
              icon={<Users size={20} className="shrink-0" />}
            >
              Choir registrations
            </ChurchButton>
            <ChurchButton
              variant="outline"
              size="lg"
              className="w-full justify-center"
              asLink
              href="/admin/events"
              icon={<Calendar size={20} className="shrink-0" />}
            >
              Events admin
            </ChurchButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </Layout>
);

export default AdminHub;
