require('./bootstrap');

import { io } from 'socket.io-client';

const socket = io('http://localhost:21465')

socket.off('receive-message').on('received-message', (message) => {
    console.log('new msg!' + JSON.stringify(message))
    window.Livewire.emit('new-message', message)
})

const chat = document.getElementById("chat");

chat.addEventListener('DOMNodeInserted', event => {
    const { currentTarget: target } = event;
    target.scroll({ top: target.scrollHeight });
});

chat.scroll({ top: chat.scrollHeight})
