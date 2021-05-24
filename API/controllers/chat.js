const socketio = require("socket.io");
//const server = require("../../server");
exports.User_connect = (req, res, next) => {
  res.status(200).json();
    // //const io = socketio("localhost:3000/chat")
    // var io= server.io
    // //console.log(io);
    // io.on("connection", (socket) => {
    //     console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    //     socket.on('disconnect', () => {
    //       console.log('user disconnected');
    //     });
    //   });
};

exports.Client_Socket=(req,res,next)=>{
  
}