var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var appRoutes = require('./routes/app');
var bigchartRoutes = require('./routes/bigchart');
var authorizeRoutes = require('./routes/authorize');
var dashboardRoutes = require('./routes/dashboard');

var app = express();
mongoose.connect('localhost:27017/db_frames');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

app.use('/bigchart', bigchartRoutes);
app.use('/authorize', authorizeRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', appRoutes);


// app.use(function(req, res, next) {
//   res.render('index');
// });

module.exports = app;
