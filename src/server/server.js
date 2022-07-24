const WebSocketServer = new require('ws');

var clients = {};
let currentId = 1;

let users = [];
let user = {};
let allmessage = [];

const webSocketServer = new WebSocketServer.Server({ port: 8081 });

webSocketServer.on('connection', function (ws) {
  const id = currentId++;
  clients[id] = ws;
  console.log('новое соединение ' + id);

  ws.send(
    JSON.stringify({
      type: 'yourId',
      id,
    })
  );

  ws.on('message', function (message) {
    var msg = JSON.parse(message);

    if (msg.type == 'id') {
      msg.id = id;
      users.push(msg);

      let newUserMess = {
        type: 'newUserMess',
        id: msg.id,
        newUser: msg.nameUser,
      };

      for (const key in clients) {
        clients[key].send(JSON.stringify(newUserMess));
      }

      let infoUsers = {
        type: 'infoUsers',
        allUsers: users,
      };
      for (const key in clients) {
        clients[key].send(JSON.stringify(infoUsers));
      }
    }

    if (msg.type == 'message') {
      allmessage.push(msg);
      for (const key in clients) {
        clients[key].send(JSON.stringify(msg));
      }
    }

    if (msg.type == 'avatar') {
      users = users.map((item) => {
        if (id === item.id) {
          return { ...item, avatarPhoto: msg.avatarPhoto };
        } else return item;
      });

      let infoUsers = {
        type: 'infoUsers',
        allUsers: users,
      };

      for (const key in clients) {
        clients[key].send(JSON.stringify(infoUsers));
      }
    }
  });

  ws.on('close', function () {
    console.log('соединение закрыто ' + id);

    users = users.filter(function (item) {
      if (item.id == id) {
        for (const key in clients) {
          item.type = 'delUserMess';
          clients[key].send(JSON.stringify(item));
        }
      }
      return item.id !== id;
    });

    let infoUsers = {
      type: 'infoUsers',
      allUsers: users,
    };
    for (const key in clients) {
      clients[key].send(JSON.stringify(infoUsers));
    }

    delete clients[id];
  });
});

console.log('Сервер запущен на порту 8081');
