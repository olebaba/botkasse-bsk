import { sql } from '@vercel/postgres'

export async function bulkInsert<T extends Record<string, unknown>>(tableName: string, records: T[]): Promise<void> {
    if (!records.length) return
    const columns = Object.keys(records[0])

    const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        SELECT ${columns.join(', ')}
        FROM json_populate_recordset(NULL::${tableName}, $1)
    `

    console.log(`Batch insert: ${JSON.stringify(records)}`)

    await sql.query(query, [JSON.stringify(records)])
}
