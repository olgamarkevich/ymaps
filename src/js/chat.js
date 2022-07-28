const socket = new WebSocket('ws://localhost:8081');

import renderUser from './../templates/userActive.hbs';
import renderMessage from './../templates/message.hbs';
import avatarPhoto from './../templates/avatarPhoto.hbs';

const messageText = document.querySelector('#messageText');
const sendButton = document.querySelector('#sendButton');
const messageContainer = document.querySelector('#messageContainer');

const loginUser = document.querySelector('#login');
const loginBtn = document.querySelector('#login-btn');
const loginForma = document.querySelector('.login');

const chatContainer = document.querySelector('#messageContainer');
const numberUsers = document.querySelector('#numberUsers');
const users = document.querySelector('.chat-users');
const avatarsStyle = document.querySelector('#avatars');
const avatarForma = document.querySelector('#avatarForma');

let user = {};
let sendMess = {};

loginBtn.addEventListener('click', function () {
  if (loginUser.value.replace(/\s+/g, '').length) {
    user.nameUser = loginUser.value;
    user.type = 'id';

    socket.send(JSON.stringify(user));

    loginForma.style.display = 'none';
    document.querySelector('.chat').style.display = 'flex';
    loginUser.value = '';

    document.querySelector('.chat-head').innerHTML = renderUser({ user });

    document.querySelector('.avatar-load-label').textContent = user.nameUser;
    document.querySelector('#avatar').addEventListener('click', function () {
      avatarForma.style.display = 'block';
    });

    document
      .querySelector('#avatar-btn-cancel')
      .addEventListener('click', closeForma);

    var avatarInput = document.getElementById('file');
    avatarInput.addEventListener('change', function () {
      let files = avatarInput.files;
      if (files.length > 0) {
        getBase64(files[0]);
      }
    });
  } else {
    loginUser.style.borderBottom = '1px solid red';
  }
});

//загрузка фото

function getBase64(file) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    user.avatar = reader.result;
    document.querySelector(
      '#avatar-load'
    ).style.backgroundImage = `url('${user.avatar}')`;
    document.querySelector('#avatar-load').style.backgroundSize = 'cover';

    document
      .querySelector('#avatar-btn-load')
      .addEventListener('click', function () {
        document.querySelector(
          '#avatar'
        ).style.backgroundImage = `url('${user.avatar}')`;

        let avatar = {
          type: 'avatar',
          id: user.id,
          avatarPhoto: reader.result,
        };
        socket.send(JSON.stringify(avatar));
        closeForma();
      });
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
}

socket.addEventListener('message', function (event) {
  var msgS = JSON.parse(event.data);

  if (msgS.type === 'yourId') {
    user.id = msgS.id;
  }

  if (msgS.type == 'newUserMess') {
    //новый пользователь
    const newUserMessDiv = `<div class='chat-info'>Пользователь  ${msgS.newUser} вошел в чат</div>`;
    chatContainer.innerHTML += newUserMessDiv;
  }

  if (msgS.type == 'delUserMess') {
    //удаленный пользователей
    const delUserMessDiv = `<div class='chat-info'>Пользователь  ${msgS.nameUser} вышел из чата</div>`;
    chatContainer.innerHTML += delUserMessDiv;
  }

  if (msgS.type == 'infoUsers') {
    //получение всех пользователей
    let allUserChat = msgS.allUsers;
    users.innerHTML = '';
    avatarsStyle.innerHTML = '';

    allUserChat.forEach((item) => {
      if (item.id !== user.id) {
        if (item.avatarPhoto) {
          item.avaPhoto = true;
        }
        users.innerHTML += avatarPhoto({ item });
      }

      if (item.avatarPhoto) {
        avatarsStyle.innerHTML += `.chat-line-avatar${item.id} {background-image: url(${item.avatarPhoto})}`;
      }

      avatarsStyle.innerHTML += `.chat-line${item.id} + .chat-line${item.id} .chat-line-avatar {display: none}`;
      avatarsStyle.innerHTML += `.chat-line${item.id} + .chat-line${item.id} .chat-line-user {display: none}`;
    });

    numberUsers.textContent = msgS.allUsers.length;
  }

  if (msgS.type == 'message') {
    //сообщения чата
    if (msgS.userId === user.id) {
      msgS.active = true;
    }

    chatContainer.innerHTML += renderMessage({ msgS });
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});

socket.addEventListener('error', function () {
  alert('Соединение закрыто или не может быть открыто');
});

function sendMessage() {
  sendMess.userId = user.id;
  sendMess.userName = user.nameUser;
  sendMess.message = messageText.value;
  sendMess.type = 'message';

  function addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
  let date = new Date();
  let hour = addZero(date.getHours());
  let minutes = addZero(date.getMinutes());
  sendMess.date = hour + ':' + minutes;

  socket.send(JSON.stringify(sendMess));
  messageText.value = '';
}

sendButton.addEventListener('click', function () {
  if (messageText.value.replace(/\s+/g, '').length) {
    sendMessage();
  }
});

function closeForma() {
  avatarForma.style.display = 'none';
}
