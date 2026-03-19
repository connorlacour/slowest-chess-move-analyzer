export type Color = 'white' | 'black'
export type Result = 'win' | 'loss' | 'draw'
export type TimeClass = 'all' | 'bullet' | 'blitz' | 'rapid'

export interface MoveEntry {
  thinkSeconds: number
  moveNumber: number
  san: string
  color: Color
  opponent: string
  userRating: number
  opponentRating: number
  result: Result
  date: string
  timeControl: string
  gameUrl: string
}

export interface TimeControlPreset {
  label: string
  val: string
}

export interface ChessComPlayer {
  username: string
  result: string
  rating: number
}

export interface ChessComGame {
  pgn: string
  time_control: string
  time_class: string
  url: string
  end_time: number
  last_activity?: number
  white: ChessComPlayer
  black: ChessComPlayer
}

export interface ChessComMonthData {
  games: ChessComGame[]
}

export interface ChessComArchives {
  archives: string[]
}

export interface DateBounds {
  fromYM: string | null
  toYM: string | null
}
