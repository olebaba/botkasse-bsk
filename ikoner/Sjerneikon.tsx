import React from 'react'

interface StjerneikonProps {
    type: 'tom' | 'favoritt' | 'egen'
    className?: string
}

const Sjerneikon: React.FC<StjerneikonProps> = ({ type, className = '' }) => {
    const getFillColor = () => {
        switch (type) {
            case 'favoritt':
                return '#FBBF24' // yellow-400 (brighter)
            case 'egen':
                return '#2563EB' // blue-600
            case 'tom':
            default:
                return 'none'
        }
    }

    const getStrokeColor = () => {
        switch (type) {
            case 'favoritt':
                return '#F59E0B' // yellow-500 (brighter)
            case 'egen':
                return '#1D4ED8' // blue-700
            case 'tom':
            default:
                return '#6B7280' // gray-500
        }
    }

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={getFillColor()}
            stroke={getStrokeColor()}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
    )
}

export default Sjerneikon
