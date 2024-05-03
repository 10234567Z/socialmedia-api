const request = require("supertest");
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();

const indexRouter = require('../routes/indexRouter');
const postsRouter = require('../routes/postsRouter');
const authRouter = require('../routes/authRouter');
const usersRouter = require('../routes/userRouter');
const { it, describe } = require("mocha");

app.use(cors())
app.use(session({ secret: "cats", resave: false, saveUninitialized: true, cookie: { maxAge: 3600000 } }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use('/', indexRouter)
app.use('/p', postsRouter)
app.use('/sg', authRouter)
app.use('/u', usersRouter)



describe('GET JSON RESPONSE', function () {
    it('responds with json', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});