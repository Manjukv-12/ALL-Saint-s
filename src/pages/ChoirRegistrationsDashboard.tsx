import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, ExternalLink, Loader2, Download, Sheet } from 'lucide-react';
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
import {
  getChoirRegistrations,
  uploadFileUrl,
  verifyAdminApiKey,
  type ChoirRegistration,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SubmitSearchField } from '@/components/SubmitSearchField';
import {
  copyTextForPaste,
  downloadChoirRegistrationsCsv,
  downloadChoirRegistrationsXlsx,
  openGoogleSheetsNewTab,
  prepareChoirRegistrationsForGoogleSheets,
} from '@/lib/exportChoirRegistrationsExcel';

const ChoirRegistrationsDashboard = () => {
  const auth = useAdminAuth(verifyAdminApiKey);
  const verifiedKey = auth.verifiedKey;
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [data, setData] = useState<{ count: number; registrations: ChoirRegistration[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [sheetsGuide, setSheetsGuide] = useState<{
    open: boolean;
    rowCount: number;
    copied: boolean;
    tsv: string;
  }>({ open: false, rowCount: 0, copied: false, tsv: '' });

  const loadWithKey = async (key: string) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const result = await getChoirRegistrations(key);
      setData(result);
      setStatus('loaded');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load');
    }
  };

  useEffect(() => {
    if (verifiedKey) void loadWithKey(verifiedKey);
    else {
      setData(null);
      setStatus('idle');
    }
  }, [verifiedKey]);

  const filteredRegistrations = useMemo(() => {
    if (!data) return [];

    const query = searchText.trim().toLowerCase();
    if (!query) return data.registrations;

    return data.registrations.filter((r) => {
      const dateValue = r.created_at ? new Date(r.created_at) : null;
      const displayDate = dateValue ? dateValue.toLocaleDateString().toLowerCase() : '';
      const isoDate = dateValue ? dateValue.toISOString().slice(0, 10) : '';

      return (
        (r.choir_name || '').toLowerCase().includes(query) ||
        (r.choir_master_name || '').toLowerCase().includes(query) ||
        (r.whatsapp || '').toLowerCase().includes(query) ||
        (r.email || '').toLowerCase().includes(query) ||
        displayDate.includes(query) ||
        isoDate.includes(query)
      );
    });
  }, [data, searchText]);

  const rowsToExport = useMemo(() => {
    if (!data) return [];
    return searchText.trim() ? filteredRegistrations : data.registrations;
  }, [data, searchText, filteredRegistrations]);

  const exportDisabled = status !== 'loaded' || !verifiedKey || rowsToExport.length === 0;

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
            <SectionTitle title="Choir Registrations" subtitle="View and manage choir registrations (admin)" light />
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              {!verifiedKey ? (
                <AdminSignInPanel
                  title="Choir registrations"
                  unlockLabel="Unlock registrations"
                  keyInput={auth.keyInput}
                  onKeyInputChange={auth.setKeyInput}
                  pending={auth.pending}
                  error={auth.error}
                  onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
                />
              ) : (
                <>
                  <AdminSessionBar onLock={auth.lock} />

                  {status === 'loaded' && data && (
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          <Users size={16} className="inline mr-1 align-text-bottom" />
                          {data.count} registration{data.count !== 1 ? 's' : ''}
                          {searchText.trim() ? ` · ${filteredRegistrations.length} shown` : ''}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => verifiedKey && loadWithKey(verifiedKey)}
                          disabled={status === 'loading'}
                        >
                          {status === 'loading' ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          Refresh
                        </Button>
                      </div>

                      <SubmitSearchField
                        value={searchText}
                        onSearch={setSearchText}
                        placeholder="Search choir, master, phone, email, date… then press Enter"
                        inputClassName="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        buttonClassName="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
                        aria-label="Search registrations"
                      />

                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium mb-3">Export</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={exportDisabled}
                            onClick={() => {
                              if (!verifiedKey) return;
                              try {
                                downloadChoirRegistrationsCsv(rowsToExport, verifiedKey);
                                setExportMessage('CSV downloaded.');
                              } catch (err: unknown) {
                                setExportMessage(err instanceof Error ? err.message : 'CSV export failed');
                              }
                            }}
                          >
                            <Download size={16} className="mr-1.5" />
                            Download CSV
                          </Button>
                          <Button
                            type="button"
                            disabled={exportDisabled}
                            onClick={() => {
                              if (!verifiedKey) return;
                              try {
                                downloadChoirRegistrationsXlsx(rowsToExport, verifiedKey);
                                setExportMessage('Excel file downloaded — open with Excel or Google Sheets.');
                              } catch (err: unknown) {
                                setExportMessage(err instanceof Error ? err.message : 'Excel export failed');
                              }
                            }}
                          >
                            <Download size={16} className="mr-1.5" />
                            Download Excel (.xlsx)
                          </Button>
                          <Button
                            type="button"
                            disabled={exportDisabled}
                            onClick={() => {
                              if (!verifiedKey) return;
                              void prepareChoirRegistrationsForGoogleSheets(rowsToExport, verifiedKey)
                                .then((result) => {
                                  setSheetsGuide({ open: true, ...result });
                                  setExportMessage(
                                    result.copied
                                      ? `${result.rowCount} row(s) copied — paste into Google Sheets (A1 → Ctrl+V).`
                                      : 'Use the popup to copy, then paste in Google Sheets.',
                                  );
                                })
                                .catch((err: unknown) => {
                                  setExportMessage(err instanceof Error ? err.message : 'Could not prepare export');
                                });
                            }}
                          >
                            <Sheet size={16} className="mr-1.5" />
                            Copy for Google Sheets
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Google Sheets: click <strong>Copy for Google Sheets</strong>, open a new sheet, select cell{' '}
                          <strong>A1</strong>, then <strong>Ctrl+V</strong>. Exports use the table below
                          {searchText.trim() ? ' (filtered rows only)' : ''}.
                        </p>
                      </div>

                      <AlertDialog
                        open={sheetsGuide.open}
                        onOpenChange={(open) => setSheetsGuide((s) => ({ ...s, open }))}
                      >
                        <AlertDialogContent className="max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Paste into Google Sheets</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <div className="space-y-3 text-left text-sm text-muted-foreground">
                                <p>
                                  {sheetsGuide.copied ? (
                                    <>
                                      <strong className="text-foreground">{sheetsGuide.rowCount} row(s)</strong> copied
                                      to clipboard.
                                    </>
                                  ) : (
                                    <>Copy the text below, then continue.</>
                                  )}
                                </p>
                                <ol className="list-decimal list-inside space-y-1">
                                  <li>Click &quot;Open Google Sheets&quot; below.</li>
                                  <li>
                                    Click cell <strong className="text-foreground">A1</strong>.
                                  </li>
                                  <li>
                                    Press <strong className="text-foreground">Ctrl+V</strong>.
                                  </li>
                                </ol>
                                {!sheetsGuide.copied && sheetsGuide.tsv ? (
                                  <textarea
                                    readOnly
                                    className="w-full h-28 text-xs font-mono border rounded-md p-2 bg-muted"
                                    value={sheetsGuide.tsv}
                                    onFocus={(e) => e.target.select()}
                                  />
                                ) : null}
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            {sheetsGuide.tsv ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (copyTextForPaste(sheetsGuide.tsv)) {
                                    setExportMessage('Copied again. Paste on cell A1 in Google Sheets.');
                                  }
                                }}
                              >
                                Copy again
                              </Button>
                            ) : null}
                            <AlertDialogAction
                              onClick={() => {
                                if (sheetsGuide.tsv && !sheetsGuide.copied) {
                                  copyTextForPaste(sheetsGuide.tsv);
                                }
                                openGoogleSheetsNewTab();
                              }}
                            >
                              Open Google Sheets
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {errorMessage && <p className="text-sm text-destructive mb-4">{errorMessage}</p>}
                  {exportMessage && (
                    <p
                      className={`text-sm mb-4 ${exportMessage.includes('failed') || exportMessage.toLowerCase().includes('no ') ? 'text-destructive' : 'text-muted-foreground'}`}
                    >
                      {exportMessage}
                    </p>
                  )}
                </>
              )}

              {status === 'loaded' && data && (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Choir</TableHead>
                          <TableHead>Master</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Video</TableHead>
                          <TableHead>Files</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((r) => (
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
                                  Link <ExternalLink size={12} />
                                </a>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="text-xs space-y-1">
                              {r.satb_notation_file && (
                                <a
                                  href={uploadFileUrl(r.satb_notation_file, verifiedKey!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-primary hover:underline"
                                >
                                  SATB
                                </a>
                              )}
                              {r.registration_fee_file && (
                                <a
                                  href={uploadFileUrl(r.registration_fee_file, verifiedKey!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-primary hover:underline"
                                >
                                  Fee proof
                                </a>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                              {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredRegistrations.length === 0 && (
                    <p className="text-sm text-muted-foreground py-6 text-center">No registrations match your search.</p>
                  )}
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default ChoirRegistrationsDashboard;
