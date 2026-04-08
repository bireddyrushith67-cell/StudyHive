export function generateCode(prefix = 'SH') {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${random}`
}
