import React from 'react'
import { beregnSum, beregnSumMaaBetales, beregnSumNyeBoter } from '@/lib/botBeregning'
import { ListBoter } from '@/komponenter/ListBoter'
import type { Spiller } from '@/lib/spillereService'
import type { Forseelse } from '@/app/api/boter/typer/route'

interface SpillerKortProps {
    spiller: Spiller
    cardRef: (el: HTMLDivElement | null) => void
    merInfoOpen: boolean
    setMerInfoSpiller: (s: Spiller | undefined) => void
    setSpillerVipps: (s: Spiller) => void
    forseelser: Forseelse[]
}

const SpillerKort: React.FC<SpillerKortProps> = ({
    spiller,
    cardRef,
    merInfoOpen,
    setMerInfoSpiller,
    setSpillerVipps,
    forseelser
}) => {
    const boter = spiller.boter
    const maaBetales = boter ? beregnSumMaaBetales(boter) : 0
    const nyeBoter = boter ? beregnSumNyeBoter(boter) : 0
    const alleBetalt = boter && boter.length > 0 ? boter.every(b => b.erBetalt) : false

    const kortBakgrunn = alleBetalt ? 'bg-green-50' : 'bg-red-50'
    const kortRing = merInfoOpen ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:ring-1 hover:ring-blue-300 cursor-pointer'
    const kortTransition = 'transition-all duration-600'

    const forseelseRef = React.useRef<HTMLDivElement>(null)
    const [forseelseHeight, setForseelseHeight] = React.useState(0)

    React.useEffect(() => {
        if (merInfoOpen && forseelseRef.current) {
            setForseelseHeight(forseelseRef.current.scrollHeight)
        } else {
            setForseelseHeight(0)
        }
    }, [merInfoOpen, spiller])

    return (
        <div
            ref={cardRef}
            className={`bg-white rounded shadow border p-4 flex flex-col gap-2 ${kortBakgrunn} ${kortRing} ${kortTransition}`}
        >
            <div
                className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between cursor-pointer"
                onClick={() => setMerInfoSpiller(merInfoOpen ? undefined : spiller)}
                tabIndex={0}
                role="button"
                aria-pressed={merInfoOpen}
            >
                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <div className="font-semibold text-lg">{spiller.navn}</div>
                    <div><span className="font-medium">Må betales:</span> {maaBetales} kr</div>
                    <div><span className="font-medium">Nye bøter:</span> {nyeBoter} kr</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded mt-2 md:mt-0 ${merInfoOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{merInfoOpen ? 'Åpen' : 'Trykk for mer info'}</span>
            </div>
            <div
                ref={forseelseRef}
                style={{ maxHeight: merInfoOpen ? forseelseHeight : 0 }}
                className={`transition-all duration-500 overflow-hidden ${merInfoOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={!merInfoOpen}
            >
                <div className="mt-2 bg-yellow-50 rounded p-2" onClick={e => e.stopPropagation()}>
                    <div className="mb-2 font-semibold">
                        <p>Sum alle bøter: {boter ? beregnSum(boter) : 0} kroner.</p>
                        <p>Betalt denne sesongen: {boter ? beregnSum(boter.filter((b) => b.erBetalt)) : 0} kroner.</p>
                    </div>
                    <button
                        className="bg-vipps-orange hover:bg-vipps-orange-dark text-white rounded px-3 py-2 mb-2"
                        onClick={e => { e.stopPropagation(); setSpillerVipps(spiller) }}
                    >
                        Betal bøter i Vipps
                    </button>
                    <ListBoter forseelser={forseelser} erBotsjef={false} spiller={spiller} />
                </div>
            </div>
        </div>
    )
}

export default SpillerKort

