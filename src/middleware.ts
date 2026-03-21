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

  // En producción usamos nonces para SCRIPTS.
  // Para ESTILOS, permitimos 'unsafe-inline' sin nonce para evitar bloqueos en atributos style="..."
  // y estilos inyectados dinámicamente que son difíciles de trackear con nonces.
  const scriptSrc = ["'self'"]
  const styleSrc = ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"]

  if (isDev) {
    scriptSrc.push("'unsafe-inline'")
    // En desarrollo ya tenemos 'unsafe-inline' en styleSrc
  } else {
    // Solo en producción activamos la política estricta de nonces para SCRIPTS
    // Añadimos 'unsafe-inline' para compatibilidad con navegadores antiguos (los modernos lo ignorarán por el nonce)
    scriptSrc.push(`'nonce-${nonce}'`, "'unsafe-inline'")
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

  // Transformar la respuesta para inyectar nonces en todos los scripts
  // Esto asegura que incluso los scripts inyectados por Astro/Vite tengan el nonce
  if (response.headers.get('content-type')?.includes('text/html')) {
    const body = await response.text()
    // Inyectamos el nonce en todas las etiquetas <script> que no lo tengan
    const transformedBody = body.replace(/<script(?![^>]*nonce=)/g, `<script nonce="${nonce}"`)
    return new Response(transformedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  }

  return response
})
