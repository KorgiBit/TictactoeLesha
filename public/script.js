const socket = io()

socket.on('connect', () => {
  console.log('Подключение к серверу установлено: ', socket.id)
})

socket.on('disconnect', () => {
  console.log('Подключение к серверу разорвано: ', socket.id)
})      