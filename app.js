var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require('mongoose')
require('./config/connection')
mongoose.set('strictQuery', false)
const session=require('express-session')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboardcat',
  resave: true,
  saveUninitialized: true,
}))

app.use('/', userRouter);
app.use('/admin', adminRouter);


module.exports = app;
