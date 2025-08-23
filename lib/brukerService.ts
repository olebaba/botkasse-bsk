import type { SpillerInfo } from '@/app/api/spillere/[id]/route.ts'

export const fetchSpillerInfo = async (brukerId: string): Promise<SpillerInfo> => {
    const response = await fetch(`/api/spillere/${brukerId}`)
    if (!response.ok) {
        throw new Error('Feil ved henting av spillerinfo')
    }
    return await response.json()
}

export const oppdaterSpillerInfo = async (brukerId: string, formData: FormData) => {
    const response = await fetch(`/api/spillere/${brukerId}`, {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        throw new Error('Feil ved henting av spillerinfo')
    }
    const res = await response.json()
    console.log(res)
    return res
}
