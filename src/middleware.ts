import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  // Generate a cryptographically secure nonce for this request
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).replace(
    /[+/=]/g,
    ''
  )

  context.locals.nonce = nonce

  const response = await next()

  // Seguridad: Cabeceras recomendadas por OWASP
  // Estas cabeceras se aplican a todas las respuestas SSR (Cloudflare Workers)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), display-capture=()'
  )

  // Content Security Policy (CSP)
  const isDev = import.meta.env.DEV

  // En producción usamos nonces, en desarrollo permitimos unsafe-inline
  // El navegador IGNORA 'unsafe-inline' si hay un nonce, por lo que en dev NO ponemos el nonce
  const scriptSrc = ["'self'"]
  const styleSrc = ["'self'", 'https://fonts.googleapis.com']

  if (isDev) {
    scriptSrc.push("'unsafe-inline'")
    styleSrc.push("'unsafe-inline'")
  } else {
    // Solo en producción activamos la política estricta de nonces
    // Añadimos 'unsafe-inline' para compatibilidad con navegadores antiguos (los modernos lo ignorarán por el nonce)
    scriptSrc.push(`'nonce-${nonce}'`, "'unsafe-inline'")
    styleSrc.push(`'nonce-${nonce}'`, "'unsafe-inline'")
  }

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
})
