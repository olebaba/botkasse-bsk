import { timingSafeEqual } from 'node:crypto'

export function erLikHemmelighet(
    innsendt: unknown,
    hemmelighet: string | null | undefined,
    valg: { ignorerStorSmaaBokstaver?: boolean } = {},
): boolean {
    if (typeof innsendt !== 'string' || innsendt === '' || !hemmelighet) return false
    const innsendtVerdi = valg.ignorerStorSmaaBokstaver ? innsendt.toLowerCase() : innsendt
    const hemmelighetVerdi = valg.ignorerStorSmaaBokstaver ? hemmelighet.toLowerCase() : hemmelighet
    const innsendtBuffer = Buffer.from(innsendtVerdi)
    const hemmelighetBuffer = Buffer.from(hemmelighetVerdi)
    return innsendtBuffer.length === hemmelighetBuffer.length && timingSafeEqual(innsendtBuffer, hemmelighetBuffer)
}
