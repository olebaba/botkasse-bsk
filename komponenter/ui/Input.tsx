import Header from '@/komponenter/ui/Header.tsx'

interface InputProps {
    tittel: string
    placeholder: string
    rediger: boolean
    type?: string
}

export const Input = ({ tittel, placeholder, rediger, type }: InputProps) => {
    const inputStyling = () => {
        return rediger
            ? 'border-blue-400 border-2 rounded placeholder-gray-400'
            : 'placeholder-black focus:outline-none'
    }
    return (
        <div className="flex flex-row justify-between items-center max-w-full">
            <Header size="small" text={tittel} />
            <input
                className={`mb-4 pl-2 w-1/2 ${inputStyling()}`}
                name={tittel}
                type={type || 'text'}
                placeholder={placeholder}
                readOnly={!rediger}
            />
        </div>
    )
}
