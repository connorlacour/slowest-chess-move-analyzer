import type { ChessComArchives, ChessComMonthData } from '../types'

const BASE = 'https://api.chess.com/pub'

export async function fetchArchives(username: string): Promise<string[]> {
  const res = await fetch(`${BASE}/player/${encodeURIComponent(username)}/games/archives`)
  if (!res.ok) throw new Error(`User "${username}" not found (${res.status})`)
  const data: ChessComArchives = await res.json()
  return data.archives ?? []
}

export async function fetchMonth(archiveUrl: string): Promise<ChessComMonthData> {
  const res = await fetch(archiveUrl)
  if (!res.ok) throw new Error(`Failed to fetch archive (${res.status})`)
  return res.json()
}
