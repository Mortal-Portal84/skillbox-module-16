function greeting () {
  const username = prompt('Введите имя пользователя')

  if (username === null) return

  if (username === '') {
    throw new Error('Имя обязательно для заполнения')
  }
}

try {
  greeting()
} catch (error) {
  alert((error as Error).message)
}
