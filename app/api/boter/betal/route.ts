import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const {botIder}: {botIder: string[]} = await request.json();

    try {
        await sql `
            UPDATE bøter
            SET er_betalt = NOT er_betalt
            WHERE id IN (${botIder.join(',')})
        `

        return NextResponse.json({message: 'Bøter markert som betalt'}, {status: 200})
    } catch (e) {
        console.error(e)
        return NextResponse.json({error: 'Klarte ikke markere bøter som betalt'}, {status: 500})
    }
}