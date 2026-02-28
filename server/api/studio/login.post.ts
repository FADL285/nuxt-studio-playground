export default eventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string, password: string }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const editors = parseEditorAllowlist()
  const editor = editors.find(e => e.email === email)

  if (!editor || !(await verifyPassword(password, editor.passwordHash))) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  await setStudioUserSession(event, {
    name: editor.name,
    email: editor.email,
    providerId: editor.email
  })

  return { ok: true }
})
