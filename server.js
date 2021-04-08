  
const http = require("http");
const app = require("./app");

const port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
 
    console.log(`Server is listening on port ${port}`)
})