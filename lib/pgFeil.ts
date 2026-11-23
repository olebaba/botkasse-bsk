export const PG_UNIK_BRUDD = '23505'
export const PG_FREMMEDNOKKEL_BRUDD = '23503'

export const pgFeilkode = (error: unknown) => (error as { code?: string })?.code
