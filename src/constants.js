// Fixed admin login, checked entirely on the client (there's no auth
// backend). Good enough to keep casual visitors out of the admin screen for
// a small trusted group — not real security. See README.md.
export const ADMIN_EMAIL = 'admin@ganesh.com'
export const ADMIN_PASSWORD = 'ganpatibappa morya'

// localStorage key for the current session ({ role: 'admin'|'user', name }).
export const SESSION_STORAGE_KEY = 'expenseManager.session'

export const CURRENCY = 'INR'
export const LOCALE = 'en-IN'
