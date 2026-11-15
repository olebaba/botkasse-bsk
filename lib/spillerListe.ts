import type { Spiller } from '@/lib/spillereService.ts'

export const leggTilSpillerIListe = (spillere: Spiller[], ny: Spiller): Spiller[] => {
    if (spillere.some((spiller) => spiller.id === ny.id)) {
        return spillere
    }
    return [...spillere, ny]
}

export const oppdaterSpillerIListe = (spillere: Spiller[], gammelId: string, oppdatert: Spiller): Spiller[] =>
    spillere.map((gammel) =>
        gammel.id === gammelId
            ? {
                  ...gammel,
                  id: oppdatert.id,
                  draktnummer: oppdatert.draktnummer,
                  navn: oppdatert.navn,
                  visNavn: oppdatert.visNavn,
                  boter: gammel.boter.map((bot) => ({ ...bot, spillerId: oppdatert.id })),
              }
            : gammel,
    )

export const fjernSpillerFraListe = (spillere: Spiller[], spillerId: string): Spiller[] =>
    spillere.filter((spiller) => spiller.id !== spillerId)
