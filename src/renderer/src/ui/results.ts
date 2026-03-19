import { state } from '../state'
import { formatTime, formatTimeControl } from '../lib/time'
import { getEl } from '../lib/dom'
import { getLimit } from './filters'
import type { MoveEntry } from '../types'

function openLink(url: string): void {
  window.open(url, '_blank')
}

function formatMatchup(entry: MoveEntry, username: string): string {
  const user     = `${username} (${entry.userRating})`
  const opponent = `${entry.opponent} (${entry.opponentRating})`
  return entry.color === 'white'
    ? `${user} · ${opponent}`
    : `${opponent} · ${user}`
}

function buildMoveRow(entry: MoveEntry, index: number, username: string): HTMLElement {
  const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
  const resultClass = entry.result
  const colorClass = entry.color

  const row = document.createElement('div')
  row.className = 'move-row'
  row.style.animationDelay = `${index * 0.04}s`
  row.innerHTML = `
    <div class="move-rank ${rankClass}">#${index + 1}</div>
    <div class="move-body">
      <div class="move-top">
        <span class="move-time">${formatTime(entry.thinkSeconds)}</span>
        <span class="move-notation">${entry.san || '?'}</span>
        <span class="move-number">move ${entry.moveNumber}</span>
        <span class="move-color-dot ${colorClass}" title="${entry.color}"></span>
      </div>
      <div class="move-meta">
        <span class="move-opponent">${formatMatchup(entry, username)}</span>
        <span class="result-badge ${resultClass}">${entry.result}</span>
        <span>${entry.date}</span>
        <span>${formatTimeControl(entry.timeControl)}</span>
      </div>
    </div>
    <button class="move-link">View game ↗</button>
  `
  const moveIndex = entry.moveNumber * 2 - (entry.color === 'white' ? 1 : 0)
  row.querySelector<HTMLButtonElement>('.move-link')!
    .addEventListener('click', () => openLink(`${entry.gameUrl}?move=${moveIndex}`))
  return row
}

export function renderResults(filterLabel: string, username: string): void {
  const block = getEl('resultsBlock')
  const list  = getEl('movesList')
  const meta  = getEl('resultsMeta')

  list.innerHTML = ''

  if (state.topN.length === 0) {
    list.innerHTML = '<div class="empty-state">No matching games found for this filter.</div>'
    meta.textContent = ''
    block.classList.add('show')
    return
  }

  meta.textContent = `${state.totalMatched.toLocaleString()} games · ${filterLabel}`
  state.topN.forEach((entry, i) => list.appendChild(buildMoveRow(entry, i, username)))
  block.classList.add('show')
}

export function renderSkeleton(): void {
  const block = getEl('resultsBlock')
  if (block.classList.contains('show')) return

  const list  = getEl('movesList')
  const meta  = getEl('resultsMeta')
  meta.textContent = 'Analyzing…'

  list.innerHTML = ''
  const count = getLimit()
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div')
    row.className = 'skeleton-row'
    row.innerHTML = `
      <div class="skel skel-rank"></div>
      <div class="skel-body">
        <div class="skel skel-top"></div>
        <div class="skel skel-meta"></div>
      </div>
      <div class="skel skel-btn"></div>
    `
    list.appendChild(row)
  }
  block.classList.add('show')
}
