import Header from '@/komponenter/ui/Header.tsx'

interface LagkasseDisplayProps {
    gjenstaendeKasse: number
    laster: boolean
}

const LagkasseDisplay = ({ gjenstaendeKasse, laster }: LagkasseDisplayProps) => {
    return (
        <div className="flex flex-row">
            <Header className="mt-2 mr-2" size="small" text="Beløp i lagkassen:" />
            {laster ? (
                <p className="mt-2 animate-spin-cool h-[20px] text-center object-cover">💰</p>
            ) : (
                <Header className="mt-2" size="small" text={`${gjenstaendeKasse} kr 💰`} />
            )}
        </div>
    )
}

export default LagkasseDisplay
