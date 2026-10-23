import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Globe,
  History,
  Image,
  Link2,
  Shield,
  Users,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { verifyAdminApiKey } from '@/lib/api';
import stainedGlass from '@/assets/stained-glass.jpg';

type ToolLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

const WEBSITE_TOOLS: ToolLink[] = [
  {
    href: '/admin/choir-registrations',
    label: 'Choir registrations',
    icon: <Users size={20} className="shrink-0" />,
  },
  { href: '/admin/events', label: 'Events admin', icon: <Calendar size={20} className="shrink-0" /> },
  { href: '/admin/gallery', label: 'Gallery admin', icon: <Image size={20} className="shrink-0" /> },
  { href: '/admin/leadership', label: 'Leadership admin', icon: <Shield size={20} className="shrink-0" /> },
  {
    href: '/admin/past-leaders',
    label: 'Past leaders admin',
    icon: <History size={20} className="shrink-0" />,
  },
  {
    href: '/admin/edavaka-dhoodhan',
    label: 'Edavaka Dhoodhan',
    icon: <BookOpen size={20} className="shrink-0" />,
  },
];

const CSI_CONNECT_HREF = '/admin/church-management/dashboard';

const AdminHub = () => {
  const auth = useAdminAuth(verifyAdminApiKey);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-primary pb-12 pt-28 sm:pb-16 sm:pt-32">
        <AdminHubHero />
      </section>

      <section className="bg-muted/50 py-10 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto flex w-full max-w-md flex-col gap-4">
              {!auth.isSignedIn ? (
                <AdminSignInPanel
                  title="Staff sign in"
                  description="Enter your admin API key once (from config.php). After that, open any admin tool below without entering the key again."
                  unlockLabel="Sign in to admin tools"
                  keyInput={auth.keyInput}
                  onKeyInputChange={auth.setKeyInput}
                  pending={auth.pending}
                  error={auth.error}
                  onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
                />
              ) : (
                <>
                  <AdminSessionBar onLock={auth.lock} />
                  <AdminToolSections />
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

function AdminHubHero() {
  return (
    <>
      <div className="absolute inset-0 opacity-10">
        <img src={stainedGlass} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <SectionTitle title="Staff tools" subtitle="Sign in once, then open Website admin or CSI Connect." light />
        </motion.div>
      </div>
    </>
  );
}

function AdminToolSections() {
  const [showWebsiteTools, setShowWebsiteTools] = useState(false);

  if (showWebsiteTools) {
    return (
      <ToolGroup
        title="Website administration"
        subtitle="Public site content and pages"
        tools={WEBSITE_TOOLS}
        onBack={() => setShowWebsiteTools(false)}
      />
    );
  }

  return (
    <>
      <p className="text-center text-sm text-muted-foreground">
        Choose an area — your key is already active.
      </p>
      <ChurchButton
        variant="primary"
        size="lg"
        className="w-full justify-center"
        onClick={() => setShowWebsiteTools(true)}
        icon={<Globe size={20} className="shrink-0" />}
      >
        Website administration
      </ChurchButton>
      <ChurchButton
        variant="outline"
        size="lg"
        className="w-full justify-center"
        asLink
        href={CSI_CONNECT_HREF}
        icon={<Link2 size={20} className="shrink-0" />}
      >
        CSI Connect
      </ChurchButton>
      <p className="text-center text-xs text-muted-foreground">
        Website tools for the public site · CSI Connect opens church management
      </p>
    </>
  );
}

function ToolGroup({
  title,
  subtitle,
  tools,
  onBack,
}: {
  title: string;
  subtitle: string;
  tools: ToolLink[];
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft size={16} aria-hidden />
        All staff tools
      </button>
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {tools.map((tool) => (
        <ChurchButton
          key={tool.href}
          variant="outline"
          size="lg"
          className="w-full justify-center"
          asLink
          href={tool.href}
          icon={tool.icon}
        >
          {tool.label}
        </ChurchButton>
      ))}
    </>
  );
}

export default AdminHub;
