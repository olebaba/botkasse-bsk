import React, {type ReactNode} from 'react';
import {Knapp} from "@/komponenter/Knapp.tsx";

interface SimpleModalProps {
    apen: boolean
    onClose: () => void
    tittel: string
    innhold?: string
    children: ReactNode
}

const EnkelModal = ({apen, onClose, tittel, innhold, children}: SimpleModalProps) => {
    if (!apen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full z-50">
                {/* Modal Title */}
                <h1 className="text-lg font-bold text-vipps-dark-blue border-b border-gray-200 pb-2 mb-4">
                    {tittel}
                </h1>

                {/* Modal Content */}
                {innhold && (
                    <div className="mb-4">
                        <p className="text-vipps-dark-gray">{innhold}</p>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default EnkelModal;
