import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const loginPagePath = resolve('./server/templates/studio-login.html')

export default eventHandler(async (event) => {
  const { redirect } = getQuery(event)

  if (redirect) {
    setCookie(event, 'studio-redirect', String(redirect), {
      path: '/',
      secure: getRequestProtocol(event) === 'https',
      httpOnly: true
    })
  }

  const sessionCheck = getCookie(event, 'studio-session-check')
  if (sessionCheck === 'true') {
    return sendRedirect(event, '/')
  }

  const html = await readFile(loginPagePath, 'utf-8')
  setResponseHeader(event, 'content-type', 'text/html')
  return html
})
