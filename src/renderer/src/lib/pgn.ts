// Extract clock readings (in seconds) from PGN [%clk H:MM:SS] annotations.
// The returned array alternates: [white_move1, black_move1, white_move2, ...]
export function parsePgn(pgn: string): number[] {
  const clkRe = /\[%clk\s+(\d+):(\d+):(\d+(?:\.\d+)?)\]/g
  const clocks: number[] = []
  let m: RegExpExecArray | null
  while ((m = clkRe.exec(pgn)) !== null) {
    clocks.push(parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]))
  }
  return clocks
}

// Extract SAN move notations in order: [White1, Black1, White2, Black2, ...]
export function extractMoves(pgn: string): string[] {
  const clean = pgn
    .replace(/^\[.*\]\s*$/gm, '') // remove PGN header tags
    .replace(/\{[^}]*\}/g, '')    // remove comments
    .replace(/\([^)]*\)/g, '')    // remove variations
    .replace(/\d+\.(\.\.)?/g, '') // remove move numbers (1. and 1...)
    .replace(/\$\d+/g, '')        // remove NAGs
    .trim()
  return clean
    .split(/\s+/)
    .filter(t => t && !['1-0', '0-1', '1/2-1/2', '*'].includes(t))
}
