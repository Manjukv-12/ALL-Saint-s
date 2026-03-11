import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Key, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getChoirRegistrations, uploadFileUrl, type ChoirRegistration } from '@/lib/api';
import { Button } from '@/components/ui/button';

const ADMIN_KEY_ENV = import.meta.env.VITE_ADMIN_API_KEY || '';

const ChoirRegistrationsDashboard = () => {
  const [apiKey, setApiKey] = useState(ADMIN_KEY_ENV);
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [data, setData] = useState<{ count: number; registrations: ChoirRegistration[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const effectiveKey = ADMIN_KEY_ENV || apiKey || keyInput;

  const loadWithKey = async (key: string) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const result = await getChoirRegistrations(key);
      setData(result);
      setApiKey(key);
      setStatus('loaded');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load');
    }
  };

  const load = () => {
    if (!effectiveKey) {
      setErrorMessage('Enter admin API key to load registrations.');
      return;
    }
    loadWithKey(effectiveKey);
  };

  useEffect(() => {
    if (ADMIN_KEY_ENV) loadWithKey(ADMIN_KEY_ENV);
  }, []);

  return (
    <Layout>
      <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SectionTitle
              title="Choir Registrations"
              subtitle="View and manage choir registrations (admin)"
              light
            />
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              {!ADMIN_KEY_ENV && (
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Key size={16} /> Admin API key
                    </label>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="Enter API key"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                  <Button onClick={load} disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    Load
                  </Button>
                </div>
              )}
              {ADMIN_KEY_ENV && (
                <div className="flex justify-end mb-4">
                  <Button onClick={load} disabled={status === 'loading'}>
                    {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    Refresh
                  </Button>
                </div>
              )}
              {status === 'error' && (
                <div className="mb-4 p-4 bg-destructive/15 rounded-xl text-destructive text-sm">{errorMessage}</div>
              )}
              {status === 'loaded' && data && (
                <>
                  <div className="flex items-center gap-2 mb-4 font-sans">
                    <Users size={20} />
                    <span className="font-semibold">Total: {data.count} registration(s)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Choir</TableHead>
                          <TableHead>Master</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Video</TableHead>
                          <TableHead>SATB / Fee</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.registrations.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.choir_name}</TableCell>
                            <TableCell>{r.choir_master_name}</TableCell>
                            <TableCell>{r.whatsapp}</TableCell>
                            <TableCell>{r.email}</TableCell>
                            <TableCell>
                              {r.video_link ? (
                                <a
                                  href={r.video_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Link <ExternalLink size={14} />
                                </a>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {r.satb_notation_file && effectiveKey && (
                                  <a
                                    href={uploadFileUrl(r.satb_notation_file, effectiveKey)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                                  >
                                    SATB <ExternalLink size={12} />
                                  </a>
                                )}
                                {r.registration_fee_file && effectiveKey && (
                                  <a
                                    href={uploadFileUrl(r.registration_fee_file, effectiveKey)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                                  >
                                    Fee <ExternalLink size={12} />
                                  </a>
                                )}
                                {!r.satb_notation_file && !r.registration_fee_file && '—'}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
              {status === 'idle' && !data && ADMIN_KEY_ENV && (
                <p className="text-muted-foreground text-sm">Click Refresh to load registrations.</p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default ChoirRegistrationsDashboard;
