import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateVippsUrl } from '@/lib/vipps'
import type { Spiller } from '@/lib/spillereService'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import EnkelModal from '@/komponenter/ui/EnkelModal.tsx'
import { beregnSumMaaBetales, filtrerBoterForSpesifikkSesong, hentSesongTekst } from '@/lib/botBeregning.ts'
import dayjs from '@/lib/dayjs.ts'

interface DialogProps {
    tittel: string
    spiller?: Spiller
    setSpiller: (spiller: Spiller | undefined) => void
    innhold?: string
    visAlleSesonger?: boolean
    valgtSesong?: string
}

const VippsDialog = ({ tittel, spiller, setSpiller, innhold, visAlleSesonger = false, valgtSesong = '' }: DialogProps) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSpiller(undefined)
    }

    useEffect(() => {
        setIsModalOpen(!!spiller)
    }, [spiller])

    if (!spiller) return null

    const beregnBelopForValgtSesong = (spiller: Spiller): number => {
        if (!spiller.boter) return 0

        let filtrerteBoter = spiller.boter

        if (visAlleSesonger || valgtSesong === 'alle') {
            // Bruk alle bøter
            return beregnSumMaaBetales(spiller.boter)
        } else if (valgtSesong === '') {
            // Bruk gjeldende sesong
            const gjeldendeSesong = hentSesongTekst()
            filtrerteBoter = filtrerBoterForSpesifikkSesong(spiller.boter, gjeldendeSesong)
        } else {
            // Bruk spesifikk sesong
            filtrerteBoter = filtrerBoterForSpesifikkSesong(spiller.boter, valgtSesong)
        }

        const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month')
        return filtrerteBoter
            .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isBefore(endOfLastMonth))
            .reduce((sum, bot) => sum + Number(bot.belop), 0)
    }

    const betalIVipps = (spiller: Spiller) => {
        const maaned = dayjs().add(-1, 'month').format('MMMM')
        const belopKr = beregnBelopForValgtSesong(spiller)
        const belopOre = belopKr * 100
        const vippsUrl = generateVippsUrl('97513023', belopOre, `Bøter for måneden ${maaned}`)
        router.push(vippsUrl)
        setSpiller(undefined)
    }

    const belopKr = beregnBelopForValgtSesong(spiller)

    return (
        <EnkelModal
            apen={isModalOpen}
            onClose={handleCloseModal}
            tittel={tittel}
            innhold={innhold || `Vipps botsjef ${belopKr} kroner?`}
        >
            <div className="flex justify-end space-x-3">
                <Knapp
                    tekst="Avbryt"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-vipps-light-gray text-vipps-dark-blue rounded-md"
                />
                <Knapp
                    tekst="Åpne vipps"
                    className="px-4 py-2 bg-vipps-orange text-white rounded-md"
                    onClick={() => {
                        betalIVipps(spiller)
                    }}
                />
            </div>
        </EnkelModal>
    )
}

export default VippsDialog
