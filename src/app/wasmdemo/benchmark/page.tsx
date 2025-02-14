'use client'

import { useEffect, useState } from 'react'
import { fibonacciJS, batchFibonacciJS } from '../fibonacci'
import styles from '../page.module.css'

interface BenchmarkResult {
  name: string
  duration: number
  result: number | number[]
}

export default function BenchmarkPage() {
  const [wasmModule, setWasmModule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [inputN, setInputN] = useState(40)
  const [batchCount, setBatchCount] = useState(1000)

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // 动态导入WASM模块
        const wasm = await import('@/wasm/pkg/wasm.js')
        console.log('WASM module loaded:', wasm)  // 调试信息
        
        console.log('WASM module initialized')  // 调试信息
        
        // 验证WASM函数是否存在
        if (typeof wasm.fibonacci !== 'function') {
          throw new Error('fibonacci function not found in WASM module')
        }
        // TODO: Add batch_fibonacci check once WASM implementation is ready
        
        setWasmModule(wasm)
      } catch (err) {
        console.error('Failed to load WASM module:', err)
        throw err  // Re-throw to see the full error in development
      } finally {
        setLoading(false)
      }
    }

    loadWasm()
  }, [])

  const runBenchmark = async () => {
    if (!wasmModule || typeof wasmModule.fibonacci !== 'function') {
      console.error('WASM module not properly initialized')
      return
    }

    try {
      setResults([])
      const newResults: BenchmarkResult[] = []

      // 单次计算 - JavaScript
      const jsStart = performance.now()
      const jsResult = fibonacciJS(inputN)
      const jsDuration = performance.now() - jsStart
      newResults.push({
        name: 'JavaScript (单次)',
        duration: jsDuration,
        result: jsResult
      })

      // 单次计算 - WebAssembly
      const wasmStart = performance.now()
      const wasmResult = wasmModule.fibonacci(inputN)
      const wasmDuration = performance.now() - wasmStart
      newResults.push({
        name: 'WebAssembly (单次)',
        duration: wasmDuration,
        result: wasmResult
      })

      // 批量计算 - JavaScript
      const jsBatchStart = performance.now()
      const jsBatchResult = batchFibonacciJS(batchCount, inputN)
      const jsBatchDuration = performance.now() - jsBatchStart
      newResults.push({
        name: 'JavaScript (批量)',
        duration: jsBatchDuration,
        result: jsBatchResult
      })

      // 批量计算 - WebAssembly
      const wasmBatchStart = performance.now()
      // TODO: Replace with WASM batch_fibonacci once implemented
      const wasmBatchResult = Array(batchCount).fill(0).map(() => wasmModule.fibonacci(inputN))
      const wasmBatchDuration = performance.now() - wasmBatchStart
      newResults.push({
        name: 'WebAssembly (批量)',
        duration: wasmBatchDuration,
        result: wasmBatchResult
      })

      setResults(newResults)
    } catch (error) {
      console.error('Error during benchmark:', error)
      throw error  // Re-throw to see the full error in development
    }
  }

  if (loading) {
    return <div>Loading WebAssembly module...</div>
  }

  return (
    <div className={styles.container}>
      <h1>WebAssembly vs JavaScript 性能对比</h1>
      
      <div className={styles.controls}>
        <div>
          <label>Fibonacci 数列第 N 项：</label>
          <input
            type="number"
            value={inputN}
            onChange={(e) => setInputN(Number(e.target.value))}
            min="0"
          />
        </div>
        
        <div>
          <label>批量计算次数：</label>
          <input
            type="number"
            value={batchCount}
            onChange={(e) => setBatchCount(Number(e.target.value))}
            min="1"
          />
        </div>

        <button onClick={runBenchmark}>运行性能测试</button>
      </div>

      {results.length > 0 && (
        <div className={styles.results}>
          <h2>测试结果</h2>
          <table>
            <thead>
              <tr>
                <th>测试类型</th>
                <th>执行时间 (ms)</th>
                <th>结果</th>
                <th>性能对比</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.name}</td>
                  <td>{result.duration.toFixed(3)}</td>
                  <td>
                    {Array.isArray(result.result)
                      ? `[${result.result.length} items]`
                      : result.result}
                  </td>
                  <td>
                    {index % 2 === 1 && (
                      `${(results[index-1].duration / result.duration).toFixed(2)}x 快`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
