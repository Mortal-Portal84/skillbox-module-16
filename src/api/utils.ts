export async function measureResponseTimeWithTiming<T> (promiseFactory: () => Promise<T>): Promise<{
  result: T;
  duration: number
}> {
  const start = performance.now()
  const result = await promiseFactory()
  const end = performance.now()

  return {
    result,
    duration: +(end - start).toFixed(3)
  }
}
