function globalError () {
  const error = Error('Глобальная ошибка')
  error.name = 'GlobalError'
  throw error
}

function localError () {
  const error = Error('Локальная ошибка')
  error.name = 'LocalError'
  throw error
}

function testErrorScope(fn: () => void) {
  try {
    try {
      fn();
    } catch (error) {
      if ((error as Error).name === 'LocalError') {
        console.log('Обнаружена локальная ошибка');
        console.error(error);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log('Обнаружена глобальная ошибка');
    console.error(error);
  }
}

testErrorScope(localError)
testErrorScope(globalError)
