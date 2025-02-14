// JavaScript 实现的 Fibonacci 函数


//动态规划实现版
export function fibonacciJS(n: number): number {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 1; i < n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

export function fibonacciJS2(n: number): number {
  if (n <= 1) return n;
  return fibonacciJS2(n - 1) + fibonacciJS2(n - 2);
}

// 批量计算 Fibonacci 数列
export function batchFibonacciJS(count: number, n: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(fibonacciJS(n));
  }
  return results;
}
