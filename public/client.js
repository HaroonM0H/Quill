const messageform = document.getElementById('message-form');
const roomForm = document.getElementById('room-form');
const input = document.getElementById('input');
const roomInput = document.getElementById('room-input'); 
const roomList = document.getElementById('rooms-list');
const messagesList = document.getElementById('messages');

const socket = io();
let currentRoom = 'general';
let username = 'User-' + Math.floor(Math.random() * 1000);
const availableRooms = ['general', 'coding', 'Jokes']

socket.on('connect', () => {
    joinRoom('general');
    socket.emit('user-joined', username);
    populateRoomList();
})

function populateRoomList() {
    roomList.innerHTML = '';
    availableRooms.forEach(room => {
        const item = document.createElement('li');
        item.textContent = room;
        if (room === currentRoom) {
            item.classList.add('active');
        }
        item.addEventListener('click', () => { 
            joinRoom(room);
        })
        roomList.appendChild(item);
    })
}

function joinRoom(room) {
    if (currentRoom) {
        messagesList.innerHTML = '';
    }

    socket.emit('join-room', room, (messages) => {
        currentRoom = room;

        if (messages && messages.length) {
            messages.forEach(msg => {
                displayMessage(msg.content, msg.sender);
            })
        }

        populateRoomList();
    })
}

function displayMessage(content, sender) {
    const item = document.createElement('li');
    item.textContent = sender + ': ' + content;
    messagesList.appendChild(item);
    // Scroll to the bottom
    messagesList.scrollTop = messagesList.scrollHeight;
}

messageform.addEventListener('submit', e => {
    e.preventDefault();
    
    if (input.value) {
        const messageContent = input.value;
        
        // Send message to server
        socket.emit('send-message', {
            content: messageContent,
            to: currentRoom,
            sender: username,
            chatName: currentRoom,
            isChannel: true
        });
        
        // Display own message
        displayMessage(messageContent, username);
        
        // Clear input
        input.value = '';
    }
});

roomForm.addEventListener('submit', e => {
    e.preventDefault();
    
    if (roomInput.value) {
        const roomName = roomInput.value;
        
        // Check if room exists in available rooms
        if (!availableRooms.includes(roomName)) {
            // For simplicity, add it to the local list
            // In the real app, create it on the server
            availableRooms.push(roomName);
        }
        
        joinRoom(roomName);
        roomInput.value = '';
    }
});

// Listen for user joined events
socket.on('user-joined', (userId) => {
    const item = document.createElement('li');
    item.textContent = userId + ' joined the chat';
    document.getElementById('messages').appendChild(item);
})

socket.on('new-message', (payload) => {
    if (payload.chatName === currentRoom) {
        displayMessage(payload.content, payload.sender);
    }
});

socket.on('new-user', (users) => {
    console.log('Updated users list:', users);
});