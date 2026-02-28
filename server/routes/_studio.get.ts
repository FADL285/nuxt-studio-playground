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

  const html = await useStorage('assets:server').getItem('studio-login.html')
  setResponseHeader(event, 'content-type', 'text/html')
  return html
})
