import { useEffect, useRef } from 'react'
import { addEventListeners, onConnectionStatusChange } from '../services/websocket'

export function useWSEvent(eventType, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const unsub = addEventListeners(eventType, (data) => {
      callbackRef.current(data)
    })
    return unsub
  }, [eventType])
}

export function useWSConnection() {
  const statusRef = useRef('DISCONNECTED')

  useEffect(() => {
    return onConnectionStatusChange((status) => {
      statusRef.current = status
    })
  }, [])

  return statusRef
}
