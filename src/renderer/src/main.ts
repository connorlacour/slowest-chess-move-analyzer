import '../styles/main.css'
import { startAnalysis, stopAnalysis } from './analysis'
import { renderCheckboxes, initDateInputs, validateDateRange } from './ui/filters'
import { showError } from './ui/error'
import { getEl } from './lib/dom'

// Expose to HTML onclick attributes
;(window as unknown as Record<string, unknown>)['startAnalysis'] = startAnalysis
;(window as unknown as Record<string, unknown>)['stopAnalysis'] = stopAnalysis
;(window as unknown as Record<string, unknown>)['onClassChange'] = () => renderCheckboxes()
;(window as unknown as Record<string, unknown>)['validateDateRange'] = validateDateRange
;(window as unknown as Record<string, unknown>)['clampResultCount'] = (el: HTMLInputElement) => {
  const v = parseInt(el.value, 10)
  if (!isNaN(v) && v > 50) el.value = '50'
  if (!isNaN(v) && v < 1)  el.value = '1'
}

// Init
renderCheckboxes()
initDateInputs()

getEl('username').addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') startAnalysis().catch(err => showError(String(err)))
})
