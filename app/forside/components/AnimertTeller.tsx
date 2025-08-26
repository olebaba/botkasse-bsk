import { useEffect, useState } from 'react'

interface AnimertTellerProps {
    målVerdi: number
    laster: boolean
}

const AnimertTeller = ({ målVerdi, laster }: AnimertTellerProps) => {
    const [visJavaScriptTeller, setVisJavaScriptTeller] = useState(false)
    const [jsVerdi, setJsVerdi] = useState(0)

    useEffect(() => {
        if (!laster && !visJavaScriptTeller) {
            // Data er lastet - estimér hvor CSS-animasjonen er nå og fortsett med JS
            const tidSidenStart = Date.now() - performance.timeOrigin
            const cssProgress = Math.min(tidSidenStart / 4000, 1)
            const estimertCssVerdi = Math.floor(10000 * (1 - Math.pow(1 - cssProgress, 3)))

            setJsVerdi(estimertCssVerdi)
            setVisJavaScriptTeller(true)

            // Animér fra estimert CSS-verdi til faktisk beløp
            const startTid = Date.now()
            const startVerdi = estimertCssVerdi

            const animasjon = () => {
                const forløptTid = Date.now() - startTid
                const fremgang = Math.min(forløptTid / 1000, 1)

                const easedFremgang = 1 - Math.pow(1 - fremgang, 3)
                const nyttTall = Math.floor(startVerdi + (målVerdi - startVerdi) * easedFremgang)

                setJsVerdi(nyttTall)

                if (fremgang < 1) {
                    requestAnimationFrame(animasjon)
                } else {
                    setJsVerdi(målVerdi)
                }
            }

            requestAnimationFrame(animasjon)
        }
    }, [laster, målVerdi])

    if (laster) {
        // CSS-animasjon som starter umiddelbart
        return <div className="text-3xl font-bold text-green-600 animert-tall-10000" />
    }

    if (visJavaScriptTeller) {
        // JavaScript-animasjon som fortsetter sømløst
        return <p className="text-3xl font-bold text-green-600">{jsVerdi} kr</p>
    }

    // Fallback
    return <p className="text-3xl font-bold text-green-600">{målVerdi} kr</p>
}

export default AnimertTeller
