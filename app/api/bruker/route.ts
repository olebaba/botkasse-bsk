import {sql} from "@vercel/postgres";
import {NextResponse} from "next/server";

export interface BrukerInfo {
    brukernavn: string;
    id: string;
    spiller_id: string;
}

type Params = {
    brukernavn: string,
    navn: string,
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params;
    const brukernavn = params.brukernavn;

    const {rows} = await sql`
        SELECT id, brukernavn, spiller_id
        FROM brukere
        WHERE brukernavn = ${brukernavn}
    `;
    const brukerInfo: BrukerInfo = rows.map((row) => ({
        brukernavn: row.brukernavn,
        spiller_id: row.spiller_id,
        id: row.id
    }))[0];

    return NextResponse.json(brukerInfo);
}