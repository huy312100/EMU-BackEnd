const socket_io = require('socket.io');
const Account = require("../models/account");
const chat = require("../models/chat");
const jwt = require("jsonwebtoken");
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
    socket.on("Create-Room",(user)=>{
        try {
            //const decoded= jwt.verify(user[0],process.env.JWT_KEY);
            //FromUser=decoded.username;
            //if(FromUser.length>=1){
                Account.find({username:user})
                .exec()
                .then(re1=>{
                    if(re1.length>=1){
                        socket.emit("Reply-Create-Room","created")
                        // Account.find({username:user[1]})
                        // .exec()
                        // .then(re2=>{
                        //     if(re2.length>=1){
                                
                        //         socket.emit("Reply-Create-Room","created")
                        //     }else{
                        //         socket.emit("Reply-Create-Room","error1");
                        //     }
                        // })
                    }else{
                        socket.emit("Reply-Create-Room","error2");
                    }
                })
            //}
        } catch (error) {
            socket.emit("Reply-Create-Room","error4");
        }
    })
    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
}