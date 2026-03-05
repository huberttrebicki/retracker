import { createContext, useContext, useState, type ReactNode } from "react"

const currencies = [
  { code: "USD", symbol: "$", label: "USD" },
  { code: "EUR", symbol: "\u20ac", label: "EUR" },
  { code: "GBP", symbol: "\u00a3", label: "GBP" },
  { code: "PLN", symbol: "z\u0142", label: "PLN" },
  { code: "JPY", symbol: "\u00a5", label: "JPY" },
  { code: "CAD", symbol: "C$", label: "CAD" },
] as const

export type CurrencyCode = (typeof currencies)[number]["code"]

export { currencies }

const CurrencyContext = createContext<{
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
}>({ currency: "USD", setCurrency: () => {} })

function getSavedCurrency(): CurrencyCode {
  const saved = localStorage.getItem("currency")
  if (saved && currencies.some((c) => c.code === saved)) return saved as CurrencyCode
  return "USD"
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getSavedCurrency)

  function setCurrency(code: CurrencyCode) {
    setCurrencyState(code)
    localStorage.setItem("currency", code)
  }

  return (
    <CurrencyContext value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
