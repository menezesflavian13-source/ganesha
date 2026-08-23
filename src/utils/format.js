import { CURRENCY, LOCALE } from '../constants'

export function formatCurrency(amount) {
  const value = Number(amount)
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(safeValue)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayISODate() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}
