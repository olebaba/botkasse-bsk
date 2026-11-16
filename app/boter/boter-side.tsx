'use client'
import { BotListe } from '@/komponenter/boter/botListe.tsx'
import { useEffect, useState } from 'react'
import { Kontakter } from '@/komponenter/spillere/Kontakter.tsx'
import Header from '@/komponenter/ui/Header.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import { fetchForseelser } from '@/lib/forseelseService.ts'
import { hentSesongTekst } from '@/lib/botBeregning.ts'
import { useUtgifter } from '@/hooks/useUtgifter.ts'
import UtgifterModal from '@/komponenter/boter/UtgifterModal.tsx'

export const BoterSide = () => {
    const [forseelser, setForseelser] = useState<Forseelse[]>([])
    const { utgifter, laster: lasterUtgifter, error: utgiftFeil } = useUtgifter()
    const [visUtgifter, setVisUtgifter] = useState(false)

    useEffect(() => {
        const hentForseelser = async () => {
            const forseelser = await fetchForseelser()
            setForseelser(forseelser)
        }

        hentForseelser().then()
    }, [])

    const gjeldendeSesong = hentSesongTekst()

    return (
        <div className="container mx-auto p-4 mt-28">
            <Header size="large" text={`Bøtesatser for ${gjeldendeSesong}`} className="mb-6" />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🏃🏻‍♂️‍➡️</span>
                        <span>Gjelder alle spillere som er med på treninger og kamper i løpet av sesongen</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🏑</span>
                        <span>Beløpene dobles på kampdager</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🧑‍⚖️</span>
                        <span>
                            Ved uenigheter avgjøres saken i en rettssak der botsjefen, en fra kapteinsteamet og en
                            utnevnt av spilleren som vil ta opp en sak er dommere
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🗓️</span>
                        <span>Bøtene betales via Vipps til botsjefen innen den 15. måneden etter boten ble gitt</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🍻</span>
                        <span>Bøtene går til lagfester, så alle bidrag går kun tilbake til laget</span>
                    </li>
                </ul>
            </div>

            <button
                type="button"
                onClick={() => setVisUtgifter(true)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
            >
                🍻 Se hva botkassen er brukt til
            </button>

            <UtgifterModal
                apen={visUtgifter}
                onClose={() => setVisUtgifter(false)}
                utgifter={utgifter}
                laster={lasterUtgifter}
                error={utgiftFeil}
            />

            <BotListe forseelser={forseelser} />
            <Kontakter />
        </div>
    )
}

export default BoterSide
