const express = require('express');
const app = express();
const cors = require('cors')
const session = require('express-session');
app.use(cors())
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
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

app.listen(3001, () => {
    console.log('listening on :3001');
});