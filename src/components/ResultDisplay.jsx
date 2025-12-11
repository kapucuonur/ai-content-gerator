import React, { useState } from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ content }) => {
    const [copied, setCopied] = useState(false);

    if (!content) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="result-display fade-in">
            <div className="result-header">
                <h3>Generated Content</h3>
                <button className="btn-copy" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy Text'}
                </button>
            </div>
            <div className="result-content">
                {content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default ResultDisplay;
