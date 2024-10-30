import React from 'react';

interface SimpleModalProps{
    open: boolean
    onClose: () => void
    title: string
    content?: string
    onConfirm: () => void
}

const SimpleModal = ({ open, onClose, title, content, onConfirm }: SimpleModalProps) => {
    if (!open) return null;

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
                    {title}
                </h1>

                {/* Modal Content */}
                {content && (
                    <div className="mb-4">
                        <p className="text-vipps-dark-gray">{content}</p>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-vipps-light-gray text-vipps-dark-blue rounded-md"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            if (onConfirm) {
                                onConfirm();
                            }
                        }}
                        className="px-4 py-2 bg-vipps-orange text-white rounded-md"
                    >
                        Åpne vipps
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleModal;
