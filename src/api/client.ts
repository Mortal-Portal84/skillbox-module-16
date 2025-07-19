const DEFAULT_URL = 'https://sb-film.skillbox.cc'

export const ping = () => fetch(`${DEFAULT_URL}/ping`, { method: 'POST' })
