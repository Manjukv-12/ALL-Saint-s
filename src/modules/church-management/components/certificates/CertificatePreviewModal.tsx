export function CertificatePreviewModal({
  html,
  onClose,
}: {
  html: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50 p-4">
      <div className="mx-auto my-4 flex max-h-[min(95dvh,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-black dark:text-white">Certificate preview (A4 portrait)</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-zinc-200 px-4 py-2 text-sm hover:bg-zinc-300 dark:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto bg-zinc-100 p-6 dark:bg-zinc-950">
          <div
            className="mx-auto bg-white shadow-md"
            style={{ width: '210mm', minHeight: '297mm' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
