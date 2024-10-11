/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, {useState} from 'react';

interface DropdownProps {
    options: any[]
    onChange: (verdi: any) => void
    label: string
    id: string
    placeholder: string
}

export const Dropdown = ({ options, onChange, label, placeholder, id }: DropdownProps) => {
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
                <option value="" disabled>{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.id}>
                        {option.draktnummer ? option.draktnummer + ' - ' : option.id + ' - '}{option.navn}
                    </option>
                ))}
            </select>
        </div>
    );
};