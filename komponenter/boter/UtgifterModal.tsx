import React from 'react'
import EnkelModal from '@/komponenter/ui/EnkelModal.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import dayjs from '@/lib/dayjs.ts'
import { summerUtgifter, type Utgift } from '@/lib/utgiftService.ts'

interface UtgifterModalProps {
    apen: boolean
    onClose: () => void
    utgifter: Utgift[]
    laster: boolean
    error: string | null
}

const beløpKlasse = (beløp: number) => (beløp < 0 ? 'text-green-600' : 'text-gray-900')

const UtgifterModal = ({ apen, onClose, utgifter, laster, error }: UtgifterModalProps) => {
    const innhold = () => {
        if (laster) {
            return (
                <div className="flex justify-center py-8">
                    <span className="text-4xl animate-spin-cool">💰</span>
                </div>
            )
        }

        if (error) {
            return <p className="text-red-600 py-4">{error}</p>
        }

        if (utgifter.length === 0) {
            return <p className="text-gray-500 py-4">Ingen utgifter registrert</p>
        }

        return (
            <>
                <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200">
                    {utgifter.map((utgift, index) => (
                        <li
                            key={`${utgift.dato}-${utgift.utgift}-${index}`}
                            className="flex justify-between gap-4 py-3"
                        >
                            <div>
                                <p className="text-gray-900">{utgift.utgift}</p>
                                <p className="text-sm text-gray-500">{dayjs(utgift.dato).format('D. MMMM YYYY')}</p>
                            </div>
                            <span className={`${beløpKlasse(utgift.beløp)} whitespace-nowrap`}>
                                {utgift.beløp.toLocaleString('nb-NO')} kr
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 mt-1">
                    <span className="font-bold text-gray-900">Totalt brukt</span>
                    <span className={`font-bold ${beløpKlasse(summerUtgifter(utgifter))} whitespace-nowrap`}>
                        {summerUtgifter(utgifter).toLocaleString('nb-NO')} kr
                    </span>
                </div>
            </>
        )
    }

    return (
        <EnkelModal apen={apen} onClose={onClose} tittel="Utgifter fra botkassen">
            {innhold()}
            <div className="flex justify-end mt-4">
                <Knapp variant="secondary" tekst="Lukk" onClick={onClose} />
            </div>
        </EnkelModal>
    )
}

export default UtgifterModal
