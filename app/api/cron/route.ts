import {NextResponse} from 'next/server';
import {sql} from "@vercel/postgres";
import {bulkInsert} from "@/lib/queries.ts";
import dayjs from "@/lib/dayjs.ts";

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({error: "Unauthorized", status: 401});
    }

    if (dayjs().date() != 1) {
        return NextResponse.json({error: "Kjørte ikke på riktig dato!"})
    }

    const unikeSpillereBoterForrigeMndQuery = await sql`
        SELECT DISTINCT(spiller_id)
        FROM bøter
        WHERE dato >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
          AND dato < DATE_TRUNC('month', CURRENT_DATE)
    `
    const spillereMedBoter: string[] = unikeSpillereBoterForrigeMndQuery.rows.map(rad => rad.spiller_id)
    const alleSpillereQuery = await sql`
        SELECT id, navn
        from spillere
    `
    const alleSpillere = alleSpillereQuery.rows.map(rad => {
        return {
            id: rad.id,
            navn: rad.navn,
        }
    })

    const spillereUtenBoter = alleSpillere
        .filter(spiller => !spillereMedBoter.includes(spiller.id));

    const values = spillereUtenBoter.map(spiller => {
        return {
            spiller_id: spiller.id,
            beløp: 50,
            forseelse_id: 7,
            dato: dayjs().subtract(1, "day").format("YYYY-MM-DD").toString()
        }
    });

    if (values.length > 0) {
        await bulkInsert("bøter", values)
    }

    return NextResponse.json({ok: true});
}