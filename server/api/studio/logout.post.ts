export default eventHandler(async (event) => {
  await clearStudioUserSession(event)
  return { ok: true }
})
