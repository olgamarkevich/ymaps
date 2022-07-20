const socket = new WebSocket('ws://localhost:8081');

const messageText = document.querySelector('#messageText');
const sendButton = document.querySelector('#sendButton');
const messageContainer = document.querySelector('#messageContainer');

const loginUser = document.querySelector('#login');
const loginBtn = document.querySelector('#login-btn');
const loginForma = document.querySelector('.login');
const chatForma = document.querySelector('.chat');
const chatContainer = document.querySelector('#messageContainer');

let user = {};

loginBtn.addEventListener('click', function () {
  user.nameUser = loginUser.value;
  user.type = 'id';
  socket.send(JSON.stringify(user));
  loginForma.style.display = 'none';
  chatForma.style.display = 'flex';
  loginUser.value = '';
});

socket.addEventListener('message', function (event) {
  var msgS = JSON.parse(event.data);
  if (msgS.type == 'newUserMess') {
    console.log(msgS.newUser);
    const newUserMessDiv = `<div class='chat-info'>Пользователь  ${msgS.newUser} вошел в чат</div>`;
    chatContainer.innerHTML += newUserMessDiv;
  }
  console.log(msgS);
});

socket.addEventListener('error', function () {
  alert('Соединение закрыто или не может быть открыто');
});

function addMessage(message) {
  const messageItem = document.createElement('li');

  messageItem.className = 'list-group-item';
  messageItem.textContent = message;

  messageContainer.appendChild(messageItem);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function sendMessage() {
  socket.send(messageText.value);
  messageText.value = '';
}

sendButton.addEventListener('click', sendMessage);
messageText.addEventListener('change', sendMessage);

console.log(socket.clientID);
