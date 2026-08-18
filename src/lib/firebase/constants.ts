// No server-only/Node dependencies here — this file is imported by Edge
// middleware as well as Node-runtime server code, so it must stay lightweight.
export const SESSION_COOKIE_NAME = 'session'
export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000 // 5 days
