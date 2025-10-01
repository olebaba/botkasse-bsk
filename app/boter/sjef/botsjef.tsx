'use client'
import { useSpillere } from '@/hooks/useSpillere.ts'
import { useForseelser } from '@/hooks/useForseelser.ts'
import LeggTilBot from '@/app/boter/sjef/legg-til-bot.tsx'
import React from 'react'

export const Botsjef = () => {
    const { spillere } = useSpillere(true)
    const { forseelser } = useForseelser()

    return (
        <>
            <LeggTilBot forseelser={forseelser} spillere={spillere} />
        </>
    )
}
