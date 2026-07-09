import { useEffect, useState } from 'react'

const DEFAULT_DELAY_MS = 700

/**
 * Simulates a server fetch — shows loading state briefly before returning mock data.
 * Re-runs when `deps` change (e.g. tab switch, filter change).
 */
export function useSimulatedQuery<T>(
  data: T,
  deps: unknown[] = [],
  options?: { delay?: number; enabled?: boolean },
) {
  const delay = options?.delay ?? DEFAULT_DELAY_MS
  const enabled = options?.enabled ?? true
  const [isLoading, setIsLoading] = useState(enabled)
  const [result, setResult] = useState<T | null>(enabled ? null : data)

  useEffect(() => {
    if (!enabled) {
      setResult(data)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setResult(null)

    const timer = window.setTimeout(() => {
      setResult(data)
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return {
    data: result,
    isLoading,
    isReady: !isLoading && result !== null,
  }
}

export function simulateDelay(ms = 450): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
