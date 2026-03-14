import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import stainedGlass from '@/assets/stained-glass.jpg';

const ENV_USER = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const ENV_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'choir2026';

const AdminAccess = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = username.trim() === ENV_USER && password === ENV_PASS;
    if (ok) {
      setStatus('idle');
      navigate('/admin/choir-registrations');
    } else {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all peer';
  const labelClass =
    'absolute left-4 top-3 text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:px-1';

  return (
    <Layout>
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
              title="Admin Access"
              subtitle="Enter the access code to view choir registrations."
              light
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-card border border-border/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>Username</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>Password</label>
                </div>
                <ChurchButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<LogIn size={20} />}
                >
                  Unlock Admin Page
                </ChurchButton>
              </form>
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-destructive/15 rounded-xl text-center"
                >
                  <p className="font-sans text-destructive text-sm flex items-center justify-center gap-2">
                    <Lock size={16} /> Incorrect username or password.
                  </p>
                </motion.div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default AdminAccess;

