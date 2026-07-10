import { useCallback, useState } from 'react'
import { simulateDelay } from './useSimulatedQuery'

export function useAsyncAction() {
  const [loading, setLoading] = useState(false)

  const run = useCallback(
    async <T,>(fn: () => T | Promise<T>, minDelayMs = 450): Promise<T> => {
      setLoading(true)
      const start = Date.now()
      try {
        const result = await fn()
        const elapsed = Date.now() - start
        if (elapsed < minDelayMs) {
          await simulateDelay(minDelayMs - elapsed)
        }
        return result
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { loading, run }
}
