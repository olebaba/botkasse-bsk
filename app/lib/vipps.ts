export function generateVippsUrl(mobilnummer: string, verdiOre: number, melding: string): string {
    const baseUrl = 'https://qr.vipps.no/28/2/01/031/';
    const version = 'v=1';
    const encodedMessage = encodeURIComponent(melding);

    return `${baseUrl}${mobilnummer}?${version}&a=${verdiOre}&m=${encodedMessage}`;
}