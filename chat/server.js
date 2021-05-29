var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var server = require("http").Server(app)
var io = require("socket.io")(server)

const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer')
const peer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peer);

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.set('view engine', 'hbs')

var messages = [
    { name: "Bushra", message: "hello" },
    { name: "Bush", message: "hii" }
]

app.get('/messages', (req, res) => {
    res.send(messages)
})

app.get('/', (req, res) => {
    res.render('index');
})


app.use(express.static('views/images'));

app.post('/messages', (req, res) => {
    messages.push(req.body)
    io.emit('message', req.body)
    res.sendStatus(200)
})


app.get('/index2', (req, res) => {
    console.log("reached");
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    res.render('index2', { RoomId: req.params.room });
});


io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
})


server.listen(3002, () => {
    console.log("Server is listening on port", server.address().port);
})