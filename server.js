  
const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3002;

const server = http.createServer(app);

const io = require("socket.io")(server);
const soctketss= require("./API/middleware/socket");
// app.use(function(req, res, next){
//   res.io = io;
//   next();
// });
//io.on("connection", soctketss.OnSocket);
io.on("connection", (socket)=>{
    console.log("connedtdddddd");
});


server.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
 
    console.log(`Server is listening on port ${port}`)
    // console.log("serverrrrrrrrrrrrrrrrrrrrr")
    // console.log(server)
    // console.log("serverrrrrrrrrrrrrrrrrrrrr")
    // console.log(io);
})