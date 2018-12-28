var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var wechat = require('./lib/wechat');
var config = require('./config/db')
var Sequelize = require('sequelize')
var app = express();

global.sequelize = new Sequelize(config.database, config.username, config.password,{
	host: 'localhost',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	logging: true
})

var indexRouter = require('./routes/index')
var uploadRouter = require('./routes/upload')


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

wechat.getAccessToken().then(token => {
	global.accessToken = token
})

app.use(wechat.init);
app.use('/', indexRouter)
app.use('/upload', uploadRouter)

module.exports = app;
