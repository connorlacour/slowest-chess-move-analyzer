import { state } from '../state'
import { getEl } from '../lib/dom'

export function setProgress(pct: number, status: string): void {
  getEl('progressBar').style.width = pct + '%'
  getEl('progressPct').textContent = Math.round(pct) + '%'
  getEl('progressStatus').textContent = status
}

export function updateStats(): void {
  getEl('statGames').textContent = state.totalGamesScanned.toLocaleString()
  getEl('statMatched').textContent = state.totalMatched.toLocaleString()
  getEl('statMoves').textContent = state.totalMoves.toLocaleString()
}
