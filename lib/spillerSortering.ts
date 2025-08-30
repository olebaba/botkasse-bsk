import type { Spiller } from './spillereService'
import {
    beregnSumForSesong,
    beregnSumMaaBetalesForSesong,
    beregnSumNyeBoterForSesong,
    beregnAntallBoterForSesong,
} from './botBeregning'

export type Sortering = 'alfabetisk' | 'antall' | 'sum' | 'sumMaaBetales' | 'sumNyeBoter'
export type Retning = 'stigende' | 'synkende'

export const sorterSpillere = (
    spillere: Spiller[],
    sortering: Sortering,
    retning: Retning,
    visAlleSesonger: boolean = false,
): Spiller[] => {
    const spillereKopi = [...spillere]
    spillereKopi.sort((a, b) => {
        let sammenligning = 0

        if (sortering === 'alfabetisk') {
            sammenligning = a.navn.localeCompare(b.navn, 'no')
        } else if (sortering === 'antall') {
            const antallA = beregnAntallBoterForSesong(a.boter, visAlleSesonger)
            const antallB = beregnAntallBoterForSesong(b.boter, visAlleSesonger)
            sammenligning = antallA - antallB
        } else if (sortering === 'sum') {
            const sumA = beregnSumForSesong(a.boter, visAlleSesonger)
            const sumB = beregnSumForSesong(b.boter, visAlleSesonger)
            sammenligning = sumA - sumB
        } else if (sortering === 'sumMaaBetales') {
            const sumA = beregnSumMaaBetalesForSesong(a.boter, visAlleSesonger)
            const sumB = beregnSumMaaBetalesForSesong(b.boter, visAlleSesonger)
            sammenligning = sumA - sumB
        } else if (sortering === 'sumNyeBoter') {
            const sumA = beregnSumNyeBoterForSesong(a.boter, visAlleSesonger)
            const sumB = beregnSumNyeBoterForSesong(b.boter, visAlleSesonger)
            sammenligning = sumA - sumB
        }

        return retning === 'stigende' ? sammenligning : -sammenligning
    })
    return spillereKopi
}
