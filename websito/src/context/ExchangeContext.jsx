import { createContext, useContext, useState, useEffect } from 'react'
import { getExchangeRate } from '../services/exchange'

const ExchangeContext = createContext(2500)

export function ExchangeProvider({ children }) {
  const [rate, setRate] = useState(2500)

  useEffect(() => {
    getExchangeRate().then(setRate)
  }, [])

  return (
    <ExchangeContext.Provider value={rate}>
      {children}
    </ExchangeContext.Provider>
  )
}

export function useExchangeRate() {
  return useContext(ExchangeContext)
}
