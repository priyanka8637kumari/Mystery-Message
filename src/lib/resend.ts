import { Resend } from 'resend';

// Use a fallback key for build time, but log a warning
const apiKey = process.env.RESEND_API_KEY || 'fallback_key_for_build';

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'development') {
  console.warn('RESEND_API_KEY is not set. Email functionality will not work.');
}

export const resend = new Resend(apiKey);