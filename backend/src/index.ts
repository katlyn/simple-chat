import 'source-map-support'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const GROUP_COUNT = Number(process.env.GROUP_COUNT)
// const prompt = 'You and your group have experienced a drastic increase in virtual communication over the last two years. What does your group feel is the most effective method of virtual communication? Why?'
const prompt = 'You and your group have experienced a drastic increase in virtual communication over the last two years. How have virtual groups been effective? How have they been ineffective? What factors influenced their effectiveness?'


const groups: Set<string>[] = []
for (let i = 0; i < GROUP_COUNT; ++i) {
  groups.push(new Set())
}

const app = express()
app.use(cors())
app.options('*', cors)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
})

process.on('SIGTERM', () => {
  server.close()
  Object.values(io.sockets.sockets).forEach(s => s.disconnect(true))
})

io.on('connection', (socket) => {
  console.log(`[Connect] ${socket.id} connected`)

  let currentGroup = -1

  // Broadcast prompt to user
  socket.emit('prompt', prompt)
  
  socket.on('requestGroup', () => {
    const lowGroup = groups.reduce((prev, curr) => curr.size < prev.size ? curr : prev)
    const index = groups.indexOf(lowGroup)

    currentGroup = index
    lowGroup.add(socket.id)
    socket.emit('groupAssignment', index)

    lowGroup.forEach(id => {
      io.to(id).emit('memberJoin', socket.id)
    })

    console.log(`[Join][Group ${currentGroup}] ${socket.id} assigned`)
  })

  socket.on('joinGroup', group => {
    groups[group].add(socket.id)
    currentGroup = group
    groups[group].forEach(id => {
      io.to(id).emit('memberJoin', socket.id)
    })
    console.log(`[Join][Group ${currentGroup}] ${socket.id} joined`)
  })

  socket.on('createMessage', message => {
    if (currentGroup === -1) {
      return
    }
    console.log(`[Message][Group ${currentGroup}] ${socket.id} - ${message}`)
    groups[currentGroup].forEach(id => io.to(id).emit('messageCreate', { id: socket.id, message }))
  })

  socket.on('disconnect', () => {
    if (currentGroup === -1) {
      return
    }
    console.log(`[Leave][Group ${currentGroup}] ${socket.id} left`)
    groups[currentGroup].delete(socket.id)
    groups[currentGroup].forEach(id => io.to(id).emit('memberLeave', socket.id))
  })
})

server.listen(80, () => {
  console.log(`[Server] Backend webserver listening`)
})
