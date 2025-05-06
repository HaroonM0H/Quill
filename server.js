import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
const app = express()
const server = http.createServer(app)
const io = new Server(server);

let users = [];

const messages = {
    "general": [],
    "coding": [],
    "Jokes": []
}

app.use(express.static('public'))

io.on('connection', socket =>{
    console.log('User '+ socket.id + ' Connected successfully')
    
    socket.on("user-joined", (username) => {
        const user = {
            username,
            id: socket.id,
        };
        users.push(user);
        io.emit("new-user", users);
    })

    socket.on("join-room", (roomName, cb) => {
        socket.join(roomName);
    
        // Broadcast to everyone in the room, including the user who joined
        io.to(roomName).emit("new-message", {
            content: `${socket.id} has joined the room.`,
            chatName: roomName,
            sender: "System"
        });
    
        // Send the room's message history to the user who joined
        cb(messages[roomName]);
    });

    
    socket.on("send-message", ({content, to, sender, chatName, isChannel }) => {
        if (isChannel) {
            const payload = {
                content,
                chatName,
                sender
            };
            socket.to(to).emit("new-message", payload);
        }else {
            const payload = {
                content,
                chatName: sender,
                sender
            };
            socket.to(to).emit("new-message", payload);
        }
        if (messages[chatName]) {
            messages[chatName].push({
                content,
                sender
            });
        }
    })

    socket.on("chat-message", (msg, client) =>{
        io.emit("chat-message", msg, client);
    })

    //listening for disconnection
    socket.on('disconnect', () =>{
        users = users.filter(user => user.id !== socket.id);
        io.emit("new-user", users)
    })
})

server.listen(3000, () => console.log('listening on port: 3000'))