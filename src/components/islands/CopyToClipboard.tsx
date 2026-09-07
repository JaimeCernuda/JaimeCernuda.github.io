import { useState } from 'react';

interface Props {
  /** Text written to the clipboard. */
  text: string;
  className?: string;
  /** Material Symbols icon name. */
  icon?: string;
  iconClassName?: string;
  /** Visible label next to the icon. */
  label?: string;
  labelClassName?: string;
  title?: string;
  toast?: string;
}

/** Button that copies `text` and shows a short toast. Hydrated with client:visible. */
export default function CopyToClipboard({
  text,
  className = '',
  icon,
  iconClassName = '',
  label,
  labelClassName = '',
  title,
  toast = 'Email copied to clipboard!',
}: Props) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="relative inline-block">
      <button type="button" onClick={handleCopy} className={className} aria-label={title ?? 'Copy to clipboard'} title={title}>
        {icon && (
          <span className={`material-symbols-outlined ${iconClassName}`} aria-hidden="true">
            {icon}
          </span>
        )}
        {label && <span className={labelClassName}>{label}</span>}
      </button>
      {showToast && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
          {toast}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
