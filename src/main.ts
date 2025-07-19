import './style.css'
import { ping } from './api'

type User = {
  name: string
  email: string
}

type Movie = {
  title: string
  releaseYear: number
  isWatched: boolean
}

type ErrorResponse = {
  errors: {
    location: string;
    param: string;
  }[]
}

type AuthFormProps = {
  onSubmit: (user: User) => void
}

function sanitize (html: string | null) {
  const el = document.createElement('div')
  if (html != null) el.innerHTML = html
  return el.textContent
}

let user: User | null = null

function setUser (userData: User) {
  user = userData
}

function getUser () {
  return user
}

async function getFilms () {
  try {
    const user = getUser()

    const headers: HeadersInit = user?.email
      ? { email: user.email }
      : {}

    const response = await fetch('https://sb-film.skillbox.cc/films', headers)

    const data = await response.json()

    if (!response.ok) {
      handleErrorResponse(data)
    }

    return data
  } catch (error) {
    handleError(error as Error)
    return []
  }
}

function handleErrorResponse (data: ErrorResponse) {
  const isNeedAuth = data.errors.some(error => error.location === 'headers' && error.param === 'email')

  if (isNeedAuth) {
    const err = new Error('Некорректный email')
    err.name = 'AuthError'
    throw err
  }
}

function handleError (error: Error) {
  if (error.name === 'AuthError') {
    throw error
  }
  console.error(error)
}

function renderTopBar (user: User) {
  const el = document.createElement('div')
  el.classList.add('topbar')

  el.innerHTML = `
    <span class="topbar-logo">Фильмотека</span>
    <div class="topbar-user user">
      <div class="user-name">${sanitize(user.name)}</div>
      <div class="user-email">${sanitize(user.email)}</div>
    </div>
  `

  return el
}

function renderFilms (films: Movie[]) {
  const el = document.createElement('div')
  el.classList.add('films')

  if (films.length === 0) {
    el.innerText = 'Список фильмов пока пуст'
    return el
  }

  films.forEach((film) => {
    const filmEl = document.createElement('div')
    filmEl.classList.add('films-card')
    filmEl.dataset.watched = film.isWatched ? 'true' : 'false'

    filmEl.textContent = `${film.title} (${film.releaseYear})`

    el.append(filmEl)
  })

  return el
}

function renderGlobalError (message: string) {
  const el = document.createElement('div')

  el.innerHTML = `
    <div class="error">
      <div class="error-title">Упс... Возникла ошибка</div>
      <div class="error-message">${sanitize(message)}</div>
    </div>
  `

  return el
}

function renderAuthForm(props: AuthFormProps): HTMLFormElement {
  const form = document.createElement('form');
  form.classList.add('authForm');

  form.innerHTML = `
    <label for="name">Ваше имя</label>
    <input id="name" type="text" name="name" required placeholder="Василий" />
    <label for="email">Эл. почта</label>
    <input id="email" type="text" name="email" required placeholder="example@mail.com" />
    <button class="authForm-submit" type="submit">Войти</button>
  `;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const formProps = Object.fromEntries(formData) as User;

    props.onSubmit(formProps);
  });

  return form;
}

function initAuth () {
  const app = document.getElementById('app')

  if (!app) return

  app.innerHTML = ''

  app.append(renderAuthForm({
    onSubmit: (user: User) => {
      setUser(user)
      initApp().then(r => r)
    }
  }))
}

async function initApp () {
  const app = document.getElementById('app')

  if (!app) return

  app.innerHTML = ''

  try {
    const user = getUser()
    if (!user) {
      initAuth()
      return
    }
    const films = await getFilms()
    app.append(renderTopBar(user))
    app.append(renderFilms(films))
  } catch (error) {
    const e = error as Error

    console.error(e)

    if (e.name === 'AuthError') {
      initAuth()
      return
    }

    app.append(renderGlobalError(e.message))
  }
}

const INTERVAL_MS = 5000
const TIMER_MS = 500

const renderError = (error: Error) => {
  const errorWrapper = document.createElement('div')
  errorWrapper.classList.add('network-error')
  errorWrapper.innerText = error.message
  errorWrapper.classList.add(error.name === 'NetworkError' ? 'network__error' : 'network__slow')

  return errorWrapper
}

const checkConnection = async () => {
  const status = document.getElementById('status')

  try {
    await ping()
  } catch (error) {
    const networkError = new Error('Проблема с сетью')
    networkError.name = 'NetworkError'

    status?.appendChild(renderError(networkError))
  }
}

initApp().then(r => r)

setInterval(checkConnection, INTERVAL_MS)
