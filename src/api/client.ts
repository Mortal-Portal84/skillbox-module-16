const DEFAULT_URL = 'https://sb-film.skillbox.cc'

export const ping = (signal: AbortSignal) =>
  fetch(`${DEFAULT_URL}/ping`, { method: 'POST', signal })
