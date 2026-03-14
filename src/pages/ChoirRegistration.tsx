import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, FileUp, Building2, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import { submitChoirRegistration } from '@/lib/api';
import stainedGlass from '@/assets/stained-glass.jpg';
import sanctusVoixPoster from '@/assets/sanctus-voix-2026-poster.png';

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
    setErrorMessage('');
    if (!satbFile) {
      setStatus('error');
      setErrorMessage('SATB notation file is required.');
      return;
    }
    if (!feeFile) {
      setStatus('error');
      setErrorMessage('Registration fee details file is required.');
      return;
    }
    setStatus('sending');
    try {
      await submitChoirRegistration({
        ...form,
        video_link: form.video_link.trim(),
        satb_notation: satbFile,
        registration_fee_file: feeFile,
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
              title="Sanctus Voix"
              subtitle="Register your choir for Sanctus Voix. Download the guidelines below; all fields with * are required."
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Poster – read event details, then register below */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center">
              <img
                src={sanctusVoixPoster}
                alt="Sanctus Voix 2026 - Online International Choir Competition. All Saints CSI Church. We warmly invite your choir to participate."
                className="w-full h-auto rounded-xl shadow-medium border border-border/50"
              />
              <p className="mt-6 font-sans text-muted-foreground text-sm sm:text-base">
                Download the guidelines and register your choir below.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Guidelines download */}
      <section className="py-6 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <a
              href="/downloads/Sanctus-Voix-Guidelines.pdf"
              download="Sanctus-Voix-Guidelines.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Download size={20} />
              Download Sanctus Voix Guidelines (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left: Registration form */}
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50">
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
                    required
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>Video link *</label>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileUp size={16} /> SATB notation (PDF or JPEG) *
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg"
                    onChange={(e) => setSatbFile(e.target.files?.[0] ?? null)}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileUp size={16} /> Registration fee details (PDF or JPG) *
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg"
                    onChange={(e) => setFeeFile(e.target.files?.[0] ?? null)}
                    required
                    className={inputClass}
                  />
                </div>
                <ChurchButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={status === 'sending'}
                  className="w-full py-2.5 text-sm md:py-3 md:text-base"
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

              {/* Right: Bank details for registration fee */}
              <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 lg:sticky lg:top-24 lg:p-6">
                <h2 className="font-sans font-semibold text-foreground flex items-center gap-2 mb-3 text-sm lg:text-base">
                  <Building2 size={18} className="text-primary lg:w-[22px] lg:h-[22px]" />
                  Bank details for registration fee
                </h2>
                <p className="text-xs text-muted-foreground mb-3 lg:text-sm">
                  Transfer the fee to the account below and upload payment proof in the form.
                </p>
                <dl className="grid gap-1.5 font-sans text-xs lg:gap-2 lg:text-sm">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground min-w-[64px] lg:min-w-[80px]">Name</dt>
                    <dd className="font-medium text-foreground">All Saints CSI Church</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground min-w-[64px] lg:min-w-[80px]">A/c No.</dt>
                    <dd className="font-medium text-foreground font-mono break-all">12800100036317</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground min-w-[64px] lg:min-w-[80px]">IFSC</dt>
                    <dd className="font-medium text-foreground font-mono">FDRL0001280</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground min-w-[64px] lg:min-w-[80px]">Bank</dt>
                    <dd className="font-medium text-foreground">Federal Bank</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground min-w-[64px] lg:min-w-[80px]">Branch</dt>
                    <dd className="font-medium text-foreground">Mission Quarters</dd>
                  </div>
                </dl>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default ChoirRegistration;
