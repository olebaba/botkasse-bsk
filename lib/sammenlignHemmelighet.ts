import { timingSafeEqual } from 'node:crypto'

export function erLikHemmelighet(innsendt: string, hemmelighet: string | undefined): boolean {
    if (!innsendt || !hemmelighet) return false
    const innsendtBuffer = Buffer.from(innsendt)
    const hemmelighetBuffer = Buffer.from(hemmelighet)
    return innsendtBuffer.length === hemmelighetBuffer.length && timingSafeEqual(innsendtBuffer, hemmelighetBuffer)
}
