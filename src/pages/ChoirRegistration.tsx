import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, FileUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import { submitChoirRegistration } from '@/lib/api';
import stainedGlass from '@/assets/stained-glass.jpg';

const ChoirRegistration = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    choir_name: '',
    choir_master_name: '',
    whatsapp: '',
    email: '',
    video_link: '',
  });
  const [satbFile, setSatbFile] = useState<File | null>(null);
  const [feeFile, setFeeFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    try {
      await submitChoirRegistration({
        ...form,
        video_link: form.video_link || undefined,
        satb_notation: satbFile || undefined,
        registration_fee_file: feeFile || undefined,
      });
      setStatus('sent');
      setForm({ choir_name: '', choir_master_name: '', whatsapp: '', email: '', video_link: '' });
      setSatbFile(null);
      setFeeFile(null);
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
      setTimeout(() => setStatus('idle'), 5000);
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
              title="Choir Registration"
              subtitle="Register your choir for events and programs. All fields with * are required."
              light
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-card border border-border/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="choir_name"
                      value={form.choir_name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder=" "
                    />
                    <label className={labelClass}>Choir name *</label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="choir_master_name"
                      value={form.choir_master_name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder=" "
                    />
                    <label className={labelClass}>Choir master name *</label>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder=" "
                    />
                    <label className={labelClass}>WhatsApp number *</label>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder=" "
                    />
                    <label className={labelClass}>Email *</label>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    name="video_link"
                    value={form.video_link}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>Video link (optional)</label>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileUp size={16} /> SATB notation (PDF or JPEG, optional)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg"
                    onChange={(e) => setSatbFile(e.target.files?.[0] ?? null)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileUp size={16} /> Registration fee details (PDF or JPG, optional)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg"
                    onChange={(e) => setFeeFile(e.target.files?.[0] ?? null)}
                    className={inputClass}
                  />
                </div>
                <ChurchButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === 'sending'}
                  className="w-full"
                  icon={
                    status === 'sent' ? (
                      <CheckCircle size={20} />
                    ) : status === 'sending' ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Send size={20} />
                      </motion.div>
                    ) : (
                      <Send size={20} />
                    )
                  }
                >
                  {status === 'sent' ? 'Submitted!' : status === 'sending' ? 'Submitting...' : 'Submit Registration'}
                </ChurchButton>
              </form>
              {status === 'sent' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-accent/20 rounded-xl text-center"
                >
                  <p className="font-sans text-accent text-sm">
                    Thank you! Your registration has been received. We will send a confirmation to your email.
                  </p>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-destructive/15 rounded-xl text-center"
                >
                  <p className="font-sans text-destructive text-sm">{errorMessage}</p>
                </motion.div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default ChoirRegistration;
