const express = require('express');
const session = require('express-session');
const cors = require('cors');
const sql = require('./config/db');
const app = express();

app.use(cors())
app.use(session({ secret: "cats", resave: false, saveUninitialized: true, cookie: { maxAge: 3600000 } }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.listen(3000, () => console.log("app listening on port 3000!"));
