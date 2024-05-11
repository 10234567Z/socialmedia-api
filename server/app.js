const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const session = require('express-session');
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000","https://admin.socket.io"],
        credentials: true
    }
});

const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
})

app.use(cors())
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.json())


const indexRouter = require('./routes/indexRouter');
const postsRouter = require('./routes/postsRouter');
const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/userRouter');
const { instrument } = require('@socket.io/admin-ui');
app.use('/', indexRouter)
app.use('/p', postsRouter)
app.use('/sg', authRouter)
app.use('/u', usersRouter)

io.engine.use(sessionMiddleware)


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

instrument(io, {
    auth: false,
    mode: "development",
    namespaceName: "/"
})

server.listen(3000, () => {
    console.log('listening on :3000');
});

module.exports = app

