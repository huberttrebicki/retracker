import { createContext, useContext, useState, type ReactNode } from "react"
import { queryOptions, useQuery, useSuspenseQuery, keepPreviousData } from "@tanstack/react-query"
import { client } from "@/lib/api"

const currenciesQuery = queryOptions({
  queryKey: ["currencies"],
  queryFn: async () => {
    const res = await client.api.currencies.$get()
    return await res.json()
  },
})

const ratesQuery = (base: string) =>
  queryOptions({
    queryKey: ["exchange-rates", base],
    queryFn: async () => {
      const res = await client.api.currencies.rates.$get({ query: { base } })
      return (await res.json()) as Record<string, number>
    },
    staleTime: 3 * 60 * 60 * 1000,
  })

const CurrencyContext = createContext<{
  currency: string
  setCurrency: (code: string) => void
  currencies: { id: string; name: string; code: string }[]
  rates: Record<string, number>
  convert: (amount: number, from: string) => number
}>({
  currency: "USD",
  setCurrency: () => {},
  currencies: [],
  rates: {},
  convert: (amount) => amount,
})

function getSavedCurrency(): string {
  return localStorage.getItem("currency") ?? "USD"
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState(getSavedCurrency)
  const { data: currencyList } = useSuspenseQuery(currenciesQuery)
  const { data: rates = {} } = useQuery({ ...ratesQuery(currency), placeholderData: keepPreviousData })

  function setCurrency(code: string) {
    setCurrencyState(code)
    localStorage.setItem("currency", code)
  }

  function convert(amount: number, from: string): number {
    if (from === currency) return amount
    const fromRate = rates[from]
    const toRate = rates[currency]
    if (!fromRate || !toRate) return amount
    return (amount / fromRate) * toRate
  }

  return (
    <CurrencyContext value={{ currency, setCurrency, currencies: currencyList, rates, convert }}>
      {children}
    </CurrencyContext>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
