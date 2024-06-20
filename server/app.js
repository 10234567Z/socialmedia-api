const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const session = require('express-session');
app.use(cors())
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())


const indexRouter = require('./routes/indexRouter');
const postsRouter = require('./routes/postsRouter');
const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/userRouter');
app.use('/', indexRouter)
app.use('/p', postsRouter)
app.use('/sg', authRouter)
app.use('/u', usersRouter)

server.listen(3001, () => {
    console.log('listening on :3001');
});

module.exports = app