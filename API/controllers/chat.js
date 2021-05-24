const socketio = require("socket.io");

exports.User_connect = (req, res, next) => {
    //const io = socketio("localhost:3000/chat")
    var io= res.io;
    console.log(io);
    io.on("connection", (socket) => {
        console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });
};
