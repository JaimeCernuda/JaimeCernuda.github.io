import React, { useState } from 'react';

const CopyToClipboard = ({ text, onCopy, children, className = "" }) => {
    const [showToast, setShowToast] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigator.clipboard.writeText(text).then(() => {
            setShowToast(true);
            if (onCopy) onCopy();

            // Hide toast after 2 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={handleCopy}
                className={className}
                aria-label="Copy to clipboard"
            >
                {children}
            </button>

            {/* Toast Notification */}
            {showToast && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 animate-fade-in-up">
                    Email copied to clipboard!
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default CopyToClipboard;
