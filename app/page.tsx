'use client';

import { useEffect, useState } from 'react';
import { Spiller, hentSpillere, oppdaterSpiller } from '@/app/lib/spillereService';
import LeggTilBot from "@/app/bøter/legg-til-bot";

export default function Forside() {
  const [spillere, setSpillere] = useState<Spiller[]>([]);
  const [navn, setNavn] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchSpillereOgNavn = async () => {
      try {
        // Hent spillernavn fra lokal JSON-fil
        const navnResponse = await fetch('/spillernavn.json');
        const navnData = await navnResponse.json();
        const navnMap = navnData.reduce((acc: { [key: number]: string }, spiller: { draktnummer: number, navn: string }) => {
          acc[spiller.draktnummer] = spiller.navn;
          return acc;
        }, {});
        setNavn(navnMap);

        // Hent spillere fra API
        const spillere = await hentSpillere();
        setSpillere(spillere);
      } catch (error) {
        setError('Kunne ikke hente data');
      } finally {
        setLoading(false);
      }
    };

    fetchSpillereOgNavn();
  }, []);

  const oppdaterNavn = (draktnummer: number, navn: string) => {
    const oppdaterteNavn = { navn, [draktnummer]: navn };
    setNavn(oppdaterteNavn);
    localStorage.setItem('spillernavn', JSON.stringify(oppdaterteNavn));
  };

  const markerBetalt = async (draktnummer: number) => {
    try {
      const spiller = spillere.find(s => s.draktnummer === draktnummer);
      if (spiller) {
        const oppdatertSpiller = await oppdaterSpiller(draktnummer, spiller.total_sum, !spiller.betalt_alle);
        setSpillere(spillere.map(s => (s.draktnummer === draktnummer ? oppdatertSpiller : s)));
      }
    } catch (error) {
      setError('Kunne ikke oppdatere spiller');
    }
  };

  if (loading) return <p>Laster...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Lagkasseoversikt</h1>
        <table className="min-w-full bg-white border border-gray-200 shadow-lg">
          <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Draktnummer</th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Navn</th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Total Sum Bøter</th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Status</th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Handling</th>
          </tr>
          </thead>
          <tbody>
          {spillere.map(spiller => (
              <tr key={spiller.draktnummer} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{spiller.draktnummer}</td>
                <td className="py-2 px-4 border-b">
                  <input
                      type="text"
                      value={navn[spiller.draktnummer] || ''}
                      placeholder="Legg til navn"
                      onChange={e => oppdaterNavn(spiller.draktnummer, e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="py-2 px-4 border-b">{spiller.total_sum} NOK</td>
                <td className="py-2 px-4 border-b">
                <span
                    className={`${
                        spiller.betalt_alle ? 'text-green-600' : 'text-red-600'
                    } font-semibold`}
                >
                  {spiller.betalt_alle ? 'Betalt' : 'Ikke betalt'}
                </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                      onClick={() => markerBetalt(spiller.draktnummer)}
                      className={`px-3 py-1 rounded ${
                          spiller.betalt_alle
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                      } hover:bg-opacity-80`}
                  >
                    {spiller.betalt_alle ? 'Marker som ikke betalt' : 'Marker som betalt'}
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

        <LeggTilBot spillere={spillere} />
      </div>
  );
}
