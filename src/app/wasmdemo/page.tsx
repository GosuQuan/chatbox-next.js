'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

export default function WasmDemo() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [result, setResult] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState<number>(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasm = await import('@/wasm/wasm')
        await wasm.default()
        setWasmModule(wasm)
      } catch (err) {
        console.error('Failed to load WASM module:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWasm()
  }, [])

  const calculateFibonacci = () => {
    if (wasmModule && inputValue >= 0) {
      const fibResult = wasmModule.fibonacci(inputValue)
      setResult(fibResult)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WebAssembly Fibonacci Calculator</h1>
      <div className={styles.content}>
        <div className={styles.inputGroup}>
          <label htmlFor="fibInput">Enter a number:</label>
          <input
            id="fibInput"
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
            className={styles.input}
          />
        </div>
        <button
          onClick={calculateFibonacci}
          className={styles.button}
          disabled={loading || !wasmModule}
        >
          {loading ? 'Loading...' : 'Calculate'}
        </button>
        {result !== null && (
          <div className={styles.result}>
            Fibonacci({inputValue}) = {result}
          </div>
        )}
      </div>
    </div>
  )
}
