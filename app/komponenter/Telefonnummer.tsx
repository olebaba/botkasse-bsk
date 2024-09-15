import React, { useState } from 'react';

export default function Telefonnummer({nummer}: { nummer: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(nummer)  // Kopierer nummeret til utklippstavlen
            .then(() => {
                setCopied(true);  // Oppdaterer tilstanden til at kopieringen var vellykket
                setTimeout(() => setCopied(false), 2000);  // Tilbakestill meldingen etter 2 sekunder
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="flex justify-start">
            <p>mob: {nummer}</p>
            <button onClick={copyToClipboard} className="text-blue-600 ml-1">
                {copied ? 'Kopiert!' : 'Kopier nummer'}
            </button>
        </div>
    );
};