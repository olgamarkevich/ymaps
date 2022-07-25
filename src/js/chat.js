const socket = new WebSocket('ws://localhost:8081');

const messageText = document.querySelector('#messageText');
const sendButton = document.querySelector('#sendButton');
const messageContainer = document.querySelector('#messageContainer');

const loginUser = document.querySelector('#login');
const loginBtn = document.querySelector('#login-btn');
const loginForma = document.querySelector('.login');

const chatForma = document.querySelector('.chat');
const chatContainer = document.querySelector('#messageContainer');

const numberUsers = document.querySelector('#numberUsers');
const userActive = document.querySelector('.chat-head');
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
    chatForma.style.display = 'flex';
    loginUser.value = '';

    const newUserActive = `
    <div class="chat-user-line">
        <div id='avatar' class="chat-user-avatar"></div>
        <div class="chat-user-label">${user.nameUser}</div>
    </div>`;
    userActive.innerHTML += newUserActive;

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
          const addUser = `
            <div class="chat-user-line">
                <div class="chat-user-avatar" style='background-image: url(${item.avatarPhoto})'></div>
                <div class="chat-user-label">${item.nameUser}</div>
            </div>`;
          users.innerHTML += addUser;
        } else {
          const addUser = `
            <div class="chat-user-line">
                <div class="chat-user-avatar"></div>
                <div class="chat-user-label">${item.nameUser}</div>
            </div>`;
          users.innerHTML += addUser;
        }
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
    let message = `
        <div class='chat-line chat-line${msgS.userId} ${
      msgS.userId === user.id ? 'active' : ''
    }'>
            <div class='chat-line-avatar chat-line-avatar${msgS.userId}'></div>
            <div class='chat-line-user'>${msgS.userName}</div>
            <div class='chat-line-i'>
              <div class='chat-line-mess'>
                <div class='chat-line-label'>${msgS.message}</div>
                <span class='chat-line-date'>${msgS.date}</span>
              </div>
            </div>
          </div>
        `;
    chatContainer.innerHTML += message;
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

sendButton.addEventListener('click', sendMessage);

function closeForma() {
  avatarForma.style.display = 'none';
}
