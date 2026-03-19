import { getEl } from '../lib/dom'

export function showError(msg: string): void {
  const box = getEl('errorBox')
  box.textContent = msg
  box.classList.add('show')
}

export function clearError(): void {
  getEl('errorBox').classList.remove('show')
}
