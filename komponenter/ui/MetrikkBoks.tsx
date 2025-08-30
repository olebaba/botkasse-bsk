import React from 'react'

interface MetrikkBoksProps {
    verdi: number
    tekst: string
    farge: 'red' | 'blue' | 'green'
    className?: string
}

const MetrikkBoks: React.FC<MetrikkBoksProps> = ({ verdi, tekst, farge, className = '' }) => {
    const fargeKlasser = {
        red: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
        blue: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
        green: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    }

    const tekstFarger = {
        red: 'text-red-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
    }

    return (
        <div className={`${fargeKlasser[farge]} rounded-lg p-2 border ${className}`}>
            <div className="text-center">
                <div className={`text-lg font-bold ${tekstFarger[farge]}`}>{verdi}</div>
                <div className="text-xs text-gray-500">{tekst}</div>
            </div>
        </div>
    )
}

export default MetrikkBoks
