import React, {useState} from 'react';

interface DropdownProps {
    options: any[]
    onChange: (verdi: any) => void
    label: string
    id: string
    placeholder: string
    idKey?: string
}

export const Dropdown = ({ options, onChange, label, placeholder, id, idKey }: DropdownProps) => {
    const [valgtId, setValgtId] = useState('')
    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="type">
                {label}
            </label>
            <select
                id={id}
                value={valgtId}
                onChange={(e) => {
                    setValgtId(e.target.value)
                    onChange(e);
                }}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="" disabled selected>{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option[idKey || 'id']}>
                        {idKey ? option[idKey || "id"] + ' - ' : ''}{option.navn}
                    </option>
                ))}
            </select>
        </div>
    );
};