import { useRef, useState } from 'react';

interface Props {
  citation: string;
  /** Classes for the trigger button. */
  className?: string;
  /** Visible label. Omit for an icon-only button. */
  label?: string;
  iconClassName?: string;
  /** Wrap the icon in the fixed-width box used by list rows. */
  wrapIcon?: boolean;
  title?: string;
}

/**
 * "Cite" button that opens a native dialog with the BibTeX entry and a copy
 * button. Hydrated with client:visible; the markup mirrors the old
 * CitationModal component.
 */
export default function CiteButton({
  citation,
  className = '',
  label,
  iconClassName = 'text-[18px]',
  wrapIcon = false,
  title,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const onBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };
  const copy = () => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const icon = (
    <span className={`material-symbols-outlined ${iconClassName}`} aria-hidden="true">
      format_quote
    </span>
  );

  return (
    <>
      <button type="button" onClick={open} className={className} title={title ?? (label ? undefined : 'Cite')} aria-label={label ? undefined : 'Cite'}>
        {wrapIcon ? <span className="w-5 inline-flex justify-center items-center">{icon}</span> : icon}
        {label && <span>{label}</span>}
      </button>

      <dialog
        ref={dialogRef}
        onClick={onBackdrop}
        className="m-auto p-0 bg-transparent max-w-2xl w-[calc(100%-2rem)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl w-full overflow-hidden border border-gray-200 dark:border-border-dark text-left">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                format_quote
              </span>
              Cite this work
            </h3>
            <button
              type="button"
              onClick={close}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-800">
              {citation}
            </pre>
            <button
              type="button"
              onClick={copy}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied to Clipboard' : 'Copy Citation'}
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
