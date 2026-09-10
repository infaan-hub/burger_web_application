import { createContext, useContext, useState, useEffect } from 'react'
import { getExchangeRate } from '../services/exchange'

const ExchangeContext = createContext(2500)

export function ExchangeProvider({ children }) {
  const [rate, setRate] = useState(2500)

  useEffect(() => {
    getExchangeRate().then(setRate).catch(() => {})
  }, [])

  return (
    <ExchangeContext.Provider value={rate}>
      {children}
    </ExchangeContext.Provider>
  )
}

export function useExchangeRate() {
  try {
    return useContext(ExchangeContext)
  } catch {
    return 2500
  }
}
