const socket_io = require('socket.io');
const Account = require("../models/account");
const chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const UserConnect = [];
const Room = [];

module.exports.OnSocket = (io, socket) => {
    var socketid = socket.id
    socket.on("Start", (user) => {
        var FromUser;
        const decoded = jwt.verify(user, process.env.JWT_KEY);
        FromUser = decoded.username;

        if (UserConnect.length !== 0) {
            const found = UserConnect.filter(el => el.username === FromUser).length;
            if (found >= 1) {
                var objIndex = UserConnect.findIndex(el => el.username === FromUser);
                socket.username = FromUser;
                var temp = {
                    "idsocket": socketid,
                    "username": FromUser
                };
                UserConnect[objIndex] = temp;
                //console.log("1");
            } else {

                socket.username = FromUser;

                var temp = {
                    "idsocket": socketid,
                    "username": FromUser
                };

                if (UserConnect !== undefined) {
                    UserConnect.push(temp);
                } else {
                    UserConnect = temp;
                }
                //console.log("2");
            }
        } else {
            socket.username = FromUser;

            var temp = {
                "idsocket": socketid,
                "username": FromUser
            };

            if (UserConnect !== undefined) {
                UserConnect.push(temp);
            } else {
                UserConnect = temp;
            }
            //console.log("3");
        }

    });
    var FromUser
    socket.on("Create-Room", (user) => {
        try {
            const decoded = jwt.verify(user[0], process.env.JWT_KEY);
            FromUser = decoded.username;
            if (FromUser.length >= 1) {
                Account.find({ username: FromUser })
                    .exec()
                    .then(re1 => {
                        if (re1.length >= 1) {
                            //socket.emit("Reply-Create-Room","created")
                            Account.find({ username: user[1] })
                                .exec()
                                .then(re2 => {
                                    if (re2.length >= 1) {
                                        chat.find({ "User": { $all: [FromUser.toString(), user[1].toString()] } })
                                            .exec()
                                            .then(re3 => {
                                                if (re3.length >= 1) {
                                                    socket.join(re3[0]._id.toString());
                                                    //const found = UserConnect.filter(el => el.username === socket.username)[0];
                                                    //io.in(found.idsocket).emit("Reply-Create-Room", socket.id);
                                                    //io.to(found.idsocket).emit("Reply-Create-Room", socket.username);
                                                    io.in(re3[0]._id.toString()).emit("Reply-Create-Room", re3[0]._id.toString());

                                                }
                                                else {
                                                    var Chat = new chat({
                                                        _id: new mongoose.Types.ObjectId(),
                                                        User: [re1[0].username, re2[0].username],
                                                        TypeRoom: "TwoPeple",
                                                        chat: []
                                                    })

                                                    var Idroom = Chat._id;
                                                    Chat.save()
                                                        .then(() => {
                                                            socket.join(Idroom.toString());
                                                            io.in(Idroom.toString()).emit("Reply-Create-Room", Idroom.toString());

                                                        })
                                                        .catch(err => {
                                                            socket.emit("Reply-Create-Room", "error1");
                                                        })
                                                }
                                            })
                                            .catch(err => {
                                                socket.emit("Reply-Create-Room", "error2");
                                            })
                                    } else {
                                        socket.emit("Reply-Create-Room", "error3");
                                    }
                                })
                        } else {
                            socket.emit("Reply-Create-Room", "error4");
                        }
                    })
            }
            else {
                socket.emit("Reply-Create-Room", "error5");
            }
        } catch (error) {
            socket.emit("Reply-Create-Room", "error");
        }
    })

    socket.on("Accepted", (data) => {
        socket.join(data);
        socket.emit("Reply-Accepted", (data));
    })

    socket.on("Private-Message", (user) => {
        //tim user ng muon gui xem co ko?
        if (user[0] !== "0329755057") {
            const found = UserConnect.filter(el => el.username === user[1]).length;

            if (found >= 1) {
                //neu co user connect

                //const hasRoom = socket.rooms.has(user[0].toString());
                const clients = io.sockets.adapter.rooms.get(user[0].toString());

                //to get the number of clients in this room
                const numClients = clients ? clients.size : 0;
                //const RoomMessage = Room.some(el => el.idRoom === user[0]);
                if (numClients <= 1) {
                    //user co connect ma ko co join room

                    console.log("user co connect ma ko co join room");
                    console.log(UserConnect);
                    console.log(user);
                    const founds = UserConnect.filter(el => el.username === user[1])[0];
                    console.log(founds.idsocket);
                    var data = [socket.username, user[0].toString()];
                    console.log(data);

                    io.to(founds.idsocket).emit("Request-Accept", data);

                }

                else {
                    //user connect ma da join room
                    //Room.push({ idRoom: user[0], chatcontext: [] });
                    if (Room.length !== 0) {

                        const currentDate = new Date();
                        const timestamp = currentDate.getTime();
                        const found2 = Room.filter(el => el.idRoom === user[0])[0];
                        if (found2.idRoom !== undefined) {
                            //room da co trong mang
                            if (found2.chatContext.length >= 10) {
                                //save into database
                                var Chat = new chat({
                                    __id: user[0],
                                    chat: []
                                });

                                for (var i = o; i < found2.chatContext.length; i++) {
                                    var chatmessage = Chat.chat;
                                    chatmessage = {
                                        from: found2.chatContext[i].from,
                                        text:found2.chatContext[i],text,
                                        time:found2.chatContext[i].time
                                    }
                                    if(Chat.chat!== undefined){
                                        Chat.chat.push(chatmessage);
                                    }
                                    else{
                                        Chat.chat =chatmessage;
                                    }
                                }

                                chat.updateOne({
                                    _id: user[0]
                                    //$and: [{ IDCourses: element.IDCourses }, { url: urlcourses }]
                                },
                                    {
                                        $push: { chat: Chat.chat }
                                    });
                                //chua emit
                            }
                            else {
                                //tiep tuc push bao room
                                for (var j =0; j<Room.length;j++){
                                    if(user[0]===Room[j].idRoom){
                                        var temp ={
                                            "from": socket.username, "text": user[3], "time": timestamp
                                        }
                                        Room[i].chatContext.push(temp);
                                    }
                                }
                            }
                            //chua emit
                        }
                        else {
                            //tao room moi
                            var temp = {
                                "idRoom": user[0],
                                "chatContext": { "from": socket.username, "text": user[3], "time": timestamp }
                            }

                            Room.push(temp);

                        }
                        //chua emit
                    }
                    else {
                        //tao room dau tien
                        var temp = {
                            "idRoom": user[0],
                            "chatContext": []
                        }
                        Room = temp;
                    }
                    //chua emit
                }
            } else {
                //neu ko co userconnect
                console.log("neu ko co userconnect");
                const currentDate = new Date();
                const timestamp = currentDate.getTime();
                var idRoomObject = mongoose.Types.ObjectId(user[0].toString())
                chat.updateOne({
                    _id: idRoomObject
                    //$and: [{ IDCourses: element.IDCourses }, { url: urlcourses }]
                },
                    {
                        $push: { chat: { from: socket.username, text: user[2], time: timestamp } }
                    });
                //var usersend =[user[0]]
                socket.emit("Private-Message-Send-Client", user);
                //io.in(user[0].toString()).emit("Private-Message", user);
            }
        }
    });

    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}