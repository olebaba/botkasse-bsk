import { sql } from '@vercel/postgres'

const TILLATTE_KOLONNER = {
    bøter: ['spiller_id', 'beløp', 'forseelse_id', 'dato'],
} as const

type Tabell = keyof typeof TILLATTE_KOLONNER
type Kolonne<T extends Tabell> = (typeof TILLATTE_KOLONNER)[T][number]

export async function bulkInsert<T extends Tabell>(
    tableName: T,
    records: Partial<Record<Kolonne<T>, unknown>>[],
): Promise<void> {
    if (!Object.hasOwn(TILLATTE_KOLONNER, tableName)) {
        throw new Error('Ugyldig tabell')
    }
    if (!records.length) return

    const tillatte: readonly string[] = TILLATTE_KOLONNER[tableName]
    const columns = Object.keys(records[0])
    if (records.some((record) => Object.keys(record).some((kolonne) => !tillatte.includes(kolonne)))) {
        throw new Error('Ugyldig kolonne')
    }

    const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        SELECT ${columns.join(', ')}
        FROM json_populate_recordset(NULL::${tableName}, $1)
    `

    await sql.query(query, [JSON.stringify(records)])
}
