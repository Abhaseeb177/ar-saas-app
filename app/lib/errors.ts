export function friendlyError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before logging in — check your inbox.'
  }
  if (lower.includes('password') && lower.includes('least')) {
    return 'Password must be at least 6 characters.'
  }
  if (lower.includes('network')) {
    return 'Connection issue — please check your internet and try again.'
  }
  return 'Something went wrong. Please try again.'
}