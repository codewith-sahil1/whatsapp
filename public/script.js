const socket = io();

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const joinBtn = document.getElementById('join-btn');
const usernameInput = document.getElementById('username-input');

const usersList = document.getElementById('users');
const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingDiv = document.getElementById('typing');

let username = '';
let typingTimeout;
let isTyping = false;

function enableChat() {
  messageInput.disabled = false;
  messageForm.querySelector('button').disabled = false;
  messageInput.focus();
}

function disableChat() {
  messageInput.disabled = true;
  messageForm.querySelector('button').disabled = true;
}

disableChat();
// code


joinBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name.length === 0) return alert('Please enter a username.');

  username = name;
  socket.emit('new-user', username);

  loginContainer.classList.add('hidden');
  chatContainer.classList.remove('hidden');

  enableChat();
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg.length === 0) return;

  // Send message to server
  socket.emit('chat-message', msg);

  // Show message locally and clear input
  addMessage('You', msg);

  messageInput.value = '';
  stopTyping();
});

messageInput.addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing');
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 1000);
});

function stopTyping() {
  if (isTyping) {
    isTyping = false;
    socket.emit('stop-typing');
  }
}

socket.on('user-list', users => {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
});

socket.on('user-joined', msg => {
  addSystemMessage(msg);
});

socket.on('user-left', msg => {
  addSystemMessage(msg);
});

socket.on('chat-message', data => {
  // Don't add the message if it's from yourself because it's already shown
  if (data.username === username) return;

  addMessage(data.username, data.message);
});

socket.on('typing', user => {
  if (user !== username) typingDiv.textContent = `${user} is typing...`;
});

socket.on('stop-typing', user => {
  if (user !== username) typingDiv.textContent = '';
});

function addMessage(user, text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<strong>${user}:</strong> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.style.fontStyle = 'italic';
  div.style.color = '#888';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
