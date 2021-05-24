const socketio = require("socket.io");
//const server = require("../../server");
const io=require("socket.io-client");
exports.User_connect = (req, res, next) => {
  
  //var socket =io.connect("http://localhost:3000");
  var socket = io("http://localhost:3000");
  socket.on("New message",(data)=>{
    console.log(data);
  });
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