import {NextResponse} from "next/server";
import {sql} from "@vercel/postgres";
import type {BrukerInfo} from "@/app/api/bruker/route.ts";

export type SpillerInfo = {
    id: string;
    navn: string;
    visNavn: string;
    totalSum: number;
}

type Params = {
    id: string,
    navn: string
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params;
    const brukernavn = params.id;

    const brukerQuery = await sql<BrukerInfo>`
        SELECT *
        FROM brukere
        WHERE brukernavn = ${brukernavn}
    `
    const brukerInfo = brukerQuery.rows[0]

    const spillerQuery = await sql<SpillerInfo>`
        SELECT *
        FROM spillere
        WHERE id = ${brukerInfo.spiller_id}
    `
    const spillerInfo: SpillerInfo = spillerQuery.rows[0]

    if (!spillerInfo) {
        console.error(`Fant ikke spiller med brukernavn ${brukernavn}`)
    }

    return NextResponse.json(spillerInfo);
}