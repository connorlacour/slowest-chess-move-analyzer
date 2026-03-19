import type { MoveEntry } from './types'

export const state = {
  aborted: false,
  totalGamesScanned: 0,
  totalMatched: 0,
  totalMoves: 0,
  topN: [] as MoveEntry[],
}

export function resetState(): void {
  state.aborted = false
  state.totalGamesScanned = 0
  state.totalMatched = 0
  state.totalMoves = 0
  state.topN = []
}
