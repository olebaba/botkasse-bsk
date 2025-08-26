'use client'
import { type FormEvent, useState, useRef, useEffect } from 'react'
import EnkelModal from '@/komponenter/ui/EnkelModal.tsx'
import { Input } from '@/komponenter/ui/Input.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import type { ActionResult } from '@/lib/auth/authConfig.ts'

interface GjesteTilgangModalProps {
    gjestebrukerAction: (formData: FormData) => Promise<ActionResult>
}

const GjesteTilgangModal = ({ gjestebrukerAction }: GjesteTilgangModalProps) => {
    const [error, setError] = useState<string | null>(null)
    const [lasterSkjema, setLasterSkjema] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const håndterSkjemaInnsending = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setLasterSkjema(true)
        const formData = new FormData(event.currentTarget)

        try {
            const result = await gjestebrukerAction(formData)
            if (result.error) {
                timeoutRef.current = setTimeout(() => {
                    setError(result.error)
                    setLasterSkjema(false)
                }, 500)
            } else {
                setLasterSkjema(false)
            }
        } catch (error) {
            timeoutRef.current = setTimeout(() => {
                setError('Noe feilet, ta kontakt med admin.')
                setLasterSkjema(false)
                console.error('Gjestepålogging feilet:', error)
            }, 500)
        }
    }

    return (
        <EnkelModal
            tittel="Siden er ikke åpen for alle"
            innhold="Fyll inn koden du har fått for å kunne se innholdet på denne siden."
            onClose={() => {}}
            apen={true}
        >
            <form onSubmit={håndterSkjemaInnsending}>
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                <Input placeholder="Kode" rediger={true} tittel="Skriv inn kode" />
                <div className="flex justify-end space-x-3">
                    <Knapp
                        className="text-white ml-auto"
                        type="submit"
                        tekst={lasterSkjema ? 'Laster...' : 'Send inn'}
                        disabled={lasterSkjema}
                    />
                </div>
            </form>
        </EnkelModal>
    )
}

export default GjesteTilgangModal
