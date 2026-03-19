export function formatTime(secs: number): string {
  if (secs >= 60) {
    const m = Math.floor(secs / 60)
    const s = Math.round(secs % 60)
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  return `${secs.toFixed(1)}s`
}

export function formatDate(ts: number): string {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTimeControl(tc: string): string {
  const [base, inc] = tc.split('+')
  const secs = parseInt(base)
  const baseLabel = secs % 60 === 0 ? String(secs / 60) : `${secs}s`
  return `${baseLabel}+${inc ?? '0'}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
