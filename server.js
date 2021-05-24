  
const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = require("socket.io")(server);

// app.use(function(req, res, next){
//   res.io = io;
//   next();
// });
// io.on("connection", (socket) => {
//     console.log('a user connecteddddddddddddddddddddddddddddddddddddddddddddddd');
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });

server.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
 
    console.log(`Server is listening on port ${port}`)
    // console.log("serverrrrrrrrrrrrrrrrrrrrr")
    // console.log(server)
    // console.log("serverrrrrrrrrrrrrrrrrrrrr")
    // console.log(io);
})