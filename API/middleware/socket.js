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
        const found = UserConnect.filter(el => el.username === socket.username)[0];
        if (found) {
            var objIndex = UserConnect.findIndex(el => el.username === socket.username);

            UserConnect[objIndex].idsocket= socketid;
        } else {
            var FromUser;
            const decoded = jwt.verify(user, process.env.JWT_KEY);
            FromUser = decoded.username;
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
        const found = UserConnect.some(el => el.username === user[1]);

        if (found) {
            //neu co user connect
            const hasRoom = socket.rooms.has(user[0].toString());
            //const RoomMessage = Room.some(el => el.idRoom === user[0]);
            if (!hasRoom) {
                //user co connect ma ko co join room
                const found1 = UserConnect.filter(el => el.username === user[1])[0];
                var data = [socket.username, user[0].toString()];
                io.to(found1.idsocket.toString()).emit("Request-Accept", data);
            }
            else {
                //user connect ma da join room
                //Room.push({ idRoom: user[0], chatcontext: [] });
                const found1 = UserConnect.filter(el => el.username === user[1])[0];
                io.to(found1.idsocket.toString()).emit("Request-Accept", "err");
            }
        } else {
            //neu ko co userconnect
            const currentDate = new Date();
            const timestamp = currentDate.getTime();
            Chat.updateOne({
                _id: user[0]
                //$and: [{ IDCourses: element.IDCourses }, { url: urlcourses }]
            },
                {
                    $push: { chat: { from: socket.username, text: user[3], time: timestamp } }
                });
            //var usersend =[user[0]]
            socket.emit("Private-Message", user);
            //io.in(user[0].toString()).emit("Private-Message", user);
        }

    });

    console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
}