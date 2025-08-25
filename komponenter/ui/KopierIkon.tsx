import React from 'react'

interface KopierIkonProps {
    kopiert: boolean
    onClick: () => void
    tittel?: string
}

const KopierIkon = ({ kopiert, onClick, tittel = 'Kopier beløp' }: KopierIkonProps) => {
    return (
        <button onClick={onClick} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title={tittel}>
            {kopiert ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            )}
        </button>
    )
}

export default KopierIkon
