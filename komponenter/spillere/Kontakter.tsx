import Telefonnummer from '@/komponenter/spillere/Telefonnummer.tsx'
import Header from '@/komponenter/ui/Header.tsx'

export const Kontakter = () => {
    const personer = [
        { rolle: 'Botsjef', navn: 'Ole Bastian Løchen', nummer: '97513023' },
        { rolle: 'Kapteinteam', navn: 'Bjørn Aasmund Fredsted', nummer: '48356855' },
        { rolle: 'Kapteinteam', navn: 'Vetle Hobbesland', nummer: '40495085' },
        { rolle: 'Kapteinteam', navn: 'Erlend Vestby', nummer: '?' },
    ]

    return (
        <div className="mx-auto mt-4">
            <Header size="medium" text="Kontaktinfo" />
            <div className="space-y-3 mt-4">
                {personer.map((person, index) => (
                    <div
                        key={index}
                        className="rounded shadow border p-4 bg-white hover:shadow-md transition-all duration-200 hover:ring-1 hover:ring-blue-300"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                    <Header size="small" text={person.navn} className="mb-0" />
                                    <Header
                                        size="small"
                                        className="text-blue-600 text-sm uppercase tracking-wide"
                                        text={person.rolle}
                                    />
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <Telefonnummer nummer={person.nummer} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Kontakter
