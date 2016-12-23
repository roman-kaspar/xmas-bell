// global imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

// local imports
const { log, nlog } = require('./utils')

// env
const port = process.env.PORT || 3000

// middleware
app.use((req, res, next) => {
  log(`[http] new request (method:${req.method}, curl:${req.url}, ip:${req.ip})`)
  next()
})
app.use('/fonts', express.static(__dirname))
app.use(express.static(__dirname))

// routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// 404 handler
app.use((req, res) => res.redirect('/'))

// main
http.listen(port, () => {
  log(`X-mas bell server listening on port ${port}!`)
  log(`http://localhost:${port}/`)
  nlog()
})

// socket.io logic
let sessions = []

const onSocketConnect = (socket) => {
  log(`[ws] client (id:${socket.id}) connected`)
  socket.on('disconnect', () => onSocketDisconnect(socket.id))
  socket.on('data', (data) => onMessage(socket, data))
}

const onSocketDisconnect = (id) => {
  log(`[ws] client (id:${id}) disconnected`)
  removeSession(id)
}

const onMessage = (socket, data) => {
  // log(`[ws] data received from client (id:${socket.id}):`)
  // nlog(JSON.stringify(data, null, 2))
  switch (data.type) {
    case 'init':
      const info = sessions.map(session => ({
        id: session.id,
        name: session.name,
        playing: session.playing,
        volume: session.volume
      }))
      log('[ws] sending list of available sessions')
      nlog(JSON.stringify(info, null, 2))
      socket.emit('data', { type: 'init', info })
      break
    case 'create':
      sessions.push({ id: socket.id, name: data.name, playing: false, volume: 50 })
      log(`[ws] new session created (id:${socket.id}, name:${data.name}), broadcasting`)
      io.emit('data', { type: 'create', id: socket.id, name: data.name })
      break
    case 'remove':
      log(`[ws] removing session (id:${socket.id})`)
      removeSession(socket.id)
      break
    case 'audio-play':
      log(`[ws] audio-play request from (id:${socket.id}) to (id:${data.id})`)
      const el1 = sessions.find((it) => (it.id === data.id))
      if (el1) {
        log('[ws] session found, broadcasting')
        el1.playing = true
        io.emit('data', { type: 'audio-play', id: data.id })
      } else { log('[ws] session not found') }
      break
    case 'audio-done':
      log(`[ws] audio-done at (id:${socket.id})`)
      const el2 = sessions.find((it) => (it.id === socket.id))
      if (el2) {
        log('[ws] session found, broadcasting')
        el2.playing = false
        io.emit('data', { type: 'audio-done', id: socket.id })
      } else { log('[ws] session not found') }
      break
    case 'audio-stop':
      log(`[ws] audio-stop request from (id:${socket.id}) to (id:${data.id})`)
      const el3 = sessions.find((it) => (it.id === data.id))
      if (el3) {
        log('[ws] session found, broadcasting')
        el3.playing = false
        io.emit('data', { type: 'audio-stop', id: data.id })
      } else { log('[ws] session not found') }
      break
    case 'volume-change':
      log(`[ws] volume-change (new value: ${data.volume}) request from (id:${socket.id}) to (id:${data.id})`)
      const el4 = sessions.find((it) => (it.id === data.id))
      if (el4) {
        log('[ws] session found, broadcasting')
        el4.volume = data.volume
        io.emit('data', { type: 'volume-change', id: data.id, volume: data.volume, from: socket.id })
      } else { log('[ws] session not found') }
      break
    default:
      log(`[ws] unknown data type "${data.type}"`)
  }
}

const removeSession = (id) => {
  const updated = sessions.filter(e => (e.id !== id))
  if (updated.length !== sessions.length) {
    log(`[ws] removing existing audio session (id:${id}), broadcasting`)
    io.emit('data', { type: 'remove', id })
    sessions = updated
  }
}

io.on('connection', onSocketConnect)
