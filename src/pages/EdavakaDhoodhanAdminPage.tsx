import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SectionTitle from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  edavakaDhoodhanFileUrl,
  getEdavakaDhoodhan,
  uploadEdavakaDhoodhan,
  verifyAdminApiKey,
} from '@/lib/api';

const EdavakaDhoodhanAdminPage = () => {
  const qc = useQueryClient();
  const auth = useAdminAuth(verifyAdminApiKey);
  const verifiedKey = auth.verifiedKey;

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const metaQuery = useQuery({
    queryKey: ['edavaka-dhoodhan', 'admin'],
    queryFn: getEdavakaDhoodhan,
    enabled: !!verifiedKey,
    retry: false,
  });

  const uploadMut = useMutation({
    mutationFn: () => uploadEdavakaDhoodhan(verifiedKey!, pdfFile!),
    onSuccess: () => {
      setMessage('PDF uploaded. The footer banner image stays the same; visitors open the new PDF when they tap it.');
      setPdfFile(null);
      qc.invalidateQueries({ queryKey: ['edavaka-dhoodhan'] });
      metaQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const meta = metaQuery.data;
  const pdfUrl = edavakaDhoodhanFileUrl(meta?.pdf_file);

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            title="Edavaka Dhoodhan"
            subtitle="Upload the PDF that opens when visitors tap the Edavaka Dhoodhan banner in the footer."
            light
          />
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-xl space-y-6">
          {!verifiedKey ? (
            <AdminSignInPanel
              title="Edavaka Dhoodhan"
              description="Upload the Edavaka Dhoodhan PDF. When visitors tap the footer banner, that PDF opens in a new tab."
              unlockLabel="Unlock"
              keyInput={auth.keyInput}
              onKeyInputChange={auth.setKeyInput}
              pending={auth.pending}
              error={auth.error}
              onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
            />
          ) : (
            <>
              <AdminSessionBar onLock={auth.lock} />

              <div className="border rounded-xl p-4 bg-card space-y-3 text-sm">
                <p className="font-medium">Currently live on the site footer</p>
                {metaQuery.isLoading && <p className="text-muted-foreground">Loading…</p>}
                {meta && (
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2 flex-wrap">
                      <FileText size={16} />
                      PDF:{' '}
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {meta.pdf_file} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="italic">none (built-in fallback until you upload)</span>
                      )}
                    </li>
                    {meta.updated_at && (
                      <li className="text-xs">Last updated: {new Date(meta.updated_at).toLocaleString()}</li>
                    )}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  The small footer picture stays the same on every page. Only the PDF behind that tap is updated here.
                </p>
                {meta?.server_limits && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    Server PHP limits: upload_max_filesize ={' '}
                    <strong>{meta.server_limits.upload_max_filesize}</strong>, post_max_size ={' '}
                    <strong>{meta.server_limits.post_max_size}</strong>. Your PDF must be smaller than upload_max_filesize
                    (2.21 MB needs at least 3M on the server; we recommend 32M).
                  </p>
                )}
              </div>

              <form
                className="border rounded-xl p-4 bg-card space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage('');
                  if (!pdfFile) {
                    setMessage('Choose a PDF file to upload.');
                    return;
                  }
                  uploadMut.mutate();
                }}
              >
                <p className="font-medium">Upload the PDF to open on tap</p>
                <p className="text-xs text-muted-foreground">
                  Choose the monthly Edavaka Dhoodhan PDF (max 20 MB). After upload, tapping the footer banner on any page opens
                  this PDF.
                </p>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">PDF (Edavaka Dhoodhan issue)</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="w-full text-sm"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button type="submit" disabled={uploadMut.isPending}>
                  {uploadMut.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Upload &amp; publish
                </Button>
                {message && (
                  <p
                    className={`text-sm ${
                      message.includes('fail') || message.includes('Choose') ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EdavakaDhoodhanAdminPage;
