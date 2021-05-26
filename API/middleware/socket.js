const socket_io = require('socket.io');
const Account = require("../models/account");
const chat = require("../models/chat");
// const io = socket_io();

// var Socket = {
    
//     emit: function (event, data) {
//         io.on("connection",(socket)=>{
//             console.log(socket.id);
//             console.log(event, data);
//         })
        
//         io.sockets.emit(event, data);
//     }
// };

// io.on("connection", function (socket) {
//     console.log("A user connectedddddddddddddddddddddddddddddddddddddd");
// });

// exports.socketConnecttion={"io":io,"socket":Socket};

exports.OnSocket =(socket)=>{
    var FromUser
    socket.on("Create-Room",(token, usercontact)=>{
        try {
            const decoded= jwt.verify(token,process.env.JWT_KEY);
            FromUser=decoded.username;
            if(FromUser!== undefined){
                Account.find({username:FromUser})
                .exec()
                .then(re1=>{
                    if(re1.length>=1){
                        Account.find({username:usercontact})
                        .exec()
                        .then(re2=>{
                            if(re2.length>=1){
                                
                                socket.emit("Reply-Create-Room","created")
                            }else{
                                socket.emit("Reply-Create-Room","error1");
                            }
                        })
                    }else{
                        socket.emit("Reply-Create-Room","error2");
                    }
                })
            }
        } catch (error) {
            socket.emit("Reply-Create-Room","error3");
        }
    })
    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
}