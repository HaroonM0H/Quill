import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

io.on('connection', socket =>{
    console.log('User Connected successfully')
    console.log(socket.id)

    socket.on("chat-message", (msg) =>{
        io.emit("chat-message", msg);
    })

    //listening for disconnection
    socket.on('disconnect', () =>{
        console.log('User Disconnected')
    })
})

server.listen(3000, () => console.log('listening on port: 3000'))