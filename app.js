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
var paypal = require('paypal-rest-sdk')
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
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYdobh3BVGoRK3lEjTRSfj8Rle8rkCNarLclaQBEDQ_wzjISOcIBmec5Zby1CeBCrA5gRr6wPe98He4R',
  'client_secret': 'EB7VaKf8Lr_-J1s6nhnM_Hb1zlwwbcPYYnm9IoXYo44gcOMX44vsGAle65tDu_2v5yerfrq8m_pJr1R6'
});

app.use('/', userRouter);
app.use('/admin', adminRouter);


module.exports = app;
