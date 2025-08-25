import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateVippsUrl } from '@/lib/vipps'
import type { Spiller } from '@/lib/spillereService'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import EnkelModal from '@/komponenter/ui/EnkelModal.tsx'
import KopierIkon from '@/komponenter/ui/KopierIkon.tsx'
import { beregnBelopForSesongvalg } from '@/lib/botBeregning.ts'
import dayjs from '@/lib/dayjs.ts'

interface DialogProps {
    tittel: string
    spiller?: Spiller
    setSpiller: (spiller: Spiller | undefined) => void
    innhold?: string
    visAlleSesonger?: boolean
    valgtSesong?: string
}

const VippsDialog = ({
    tittel,
    spiller,
    setSpiller,
    innhold,
    visAlleSesonger = false,
    valgtSesong = '',
}: DialogProps) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [kopiert, setKopiert] = useState(false)
    const [visBelop, setVisBelop] = useState(true)

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSpiller(undefined)
    }

    useEffect(() => {
        setIsModalOpen(!!spiller)
    }, [spiller])

    if (!spiller) return null

    const betalIVipps = (spiller: Spiller) => {
        const maaned = dayjs().add(-1, 'month').format('MMMM')
        const belopKr = beregnBelopForSesongvalg(spiller.boter || [], visAlleSesonger, valgtSesong)
        const belopOre = belopKr * 100
        const vippsUrl = generateVippsUrl('97513023', belopOre, `Bøter for måneden ${maaned}`)

        // Kopier URL til utklippstavle før vi åpner Vipps
        navigator.clipboard.writeText(vippsUrl).then(() => {
            setKopiert(true)
            setVisBelop(false)
            setTimeout(() => {
                setKopiert(false)
                setVisBelop(true)
                router.push(vippsUrl)
                setSpiller(undefined)
            }, 1000)
        })
    }

    const kopierBelop = async () => {
        const belopKr = beregnBelopForSesongvalg(spiller.boter || [], visAlleSesonger, valgtSesong)
        await navigator.clipboard.writeText(belopKr.toString())
        setKopiert(true)
        setVisBelop(false)
        setTimeout(() => {
            setKopiert(false)
            setVisBelop(true)
        }, 1000)
    }

    const belopKr = beregnBelopForSesongvalg(spiller.boter || [], visAlleSesonger, valgtSesong)

    return (
        <EnkelModal apen={isModalOpen} onClose={handleCloseModal} tittel={tittel} innhold={innhold}>
            <div className="text-center">
                <p className="mb-4">{!innhold && `Vipps botsjef følgende beløp:`}</p>
                <div
                    className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={kopierBelop}
                >
                    <div className="flex items-center justify-center space-x-2 relative">
                        <div className={`transition-opacity duration-300 ${visBelop ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold text-vipps-orange">{belopKr} kr</span>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <KopierIkon kopiert={kopiert} onClick={kopierBelop} />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`absolute transition-opacity duration-300 ${!visBelop ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <span className="text-2xl font-bold text-green-600">Beløp kopiert</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <Knapp
                        tekst="Avbryt"
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-vipps-light-gray text-vipps-dark-blue rounded-md"
                    />
                    <Knapp
                        tekst={belopKr === 0 ? 'Ingen bøter å betale' : kopiert ? 'Kopierer...' : 'Åpne Vipps'}
                        className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                            belopKr === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-vipps-orange text-white hover:bg-orange-600'
                        }`}
                        onClick={belopKr === 0 ? undefined : () => betalIVipps(spiller)}
                    />
                </div>
            </div>
        </EnkelModal>
    )
}

export default VippsDialog
