import React from 'react';

export enum AlertTypes {
    ERROR = 'error' , WARNING = 'warning', INFO = 'info' , SUCCESS = 'success'
}

interface AlertProps{
    message: string
    type: AlertTypes
    onClose?: () => void
}

const AlertBanner = ({ message, type = AlertTypes.INFO, onClose }: AlertProps) => {
    // Define styles based on alert type
    const typeStyles = {
        success: 'bg-green-100 text-green-800 border-green-400',
        error: 'bg-red-100 text-red-800 border-red-400',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
        info: 'bg-blue-100 text-blue-800 border-blue-400',
    };

    return (
        <div
            className={`flex justify-between items-center border-l-4 p-4 ${typeStyles[type]} mb-4`}
            role="alert"
        >
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-lg font-bold ml-4 focus:outline-none"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default AlertBanner;
