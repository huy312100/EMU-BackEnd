const socket_io = require('socket.io');
const io = socket_io();

var Socket = {
    
    emit: function (event, data) {
        io.on("connection",(socket)=>{
            console.log(socket.id);
            console.log(event, data);
        })
        
        io.sockets.emit(event, data);
    }
};

io.on("connection", function (socket) {
    console.log("A user connectedddddddddddddddddddddddddddddddddddddd");
});

exports.socketConnecttion={"io":io,"socket":Socket};