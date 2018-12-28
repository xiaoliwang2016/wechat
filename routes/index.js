var express = require('express')
var router = express.Router()
var getRawBody = require('raw-body')
var contentType = require('content-type')
var utils = require('../lib/utils.js')
var template = require('../lib/template.js')

// 微信官方请求回调接口
router.all('/', function(req, res, next) {
	var data = getRawBody(req, {
		length: req.headers['content-length'],
		limit: '1mb',
		encoding: contentType.parse(req).parameters.charset
	}, function(err, buf) {
		if (err) return next(err)
		utils.formatMessage(buf.toString()).then(message => {
			if (message.MsgType == 'event') {
				if (message.Event === 'subscribe') {
					if (message.EventKey) {
						console.log('扫描二维码关注：' + message.EventKey + ' ' + message.ticket);
					}
					message.reply = '终于等到你，还好我没放弃';
				} else if (message.Event === 'unsubscribe') {
					message.reply = '';
					console.log(message.FromUserName + ' 悄悄地走了...');
				} else if (message.Event === 'LOCATION') {
					message.reply = '您上报的地理位置是：' + message.Latitude + ',' + message.Longitude;
				} else if (message.Event === 'CLICK') {
					message.reply = '您点击了菜单：' + message.EventKey;
				} else if (message.Event === 'SCAN') {
					message.reply = '关注后扫描二维码：' + message.Ticket;
				}
				res.send(template.textMessage(message))
			} else if (message.MsgType === 'text') {
				var content = message.Content
				if (content === '1') {
					message.reply = '金刚:骷髅岛'
					res.send(template.textMessage(message))
				} else if (content === '2') {
					message.mediaId = 'owC_u5JjMNwu1SyP0xEIh8mZDai5tMBjQ566aNPPWFSo-JlD_qcsffU75yJTvymU'
					res.send(template.imageMessage(message))
				} else if (content === '3') {
					message.articles = [{
						title: '金刚.骷髅岛',
						description: '南太平洋上的神秘岛屿——骷髅岛。史上最大金刚与邪恶骷髅蜥蜴的较量。',
						picUrl: 'http://tu.23juqing.com/d/file/html/gndy/dyzz/2017-04-09/da9c7a64ab7df196d08b4b327ef248f2.jpg',
						url: 'http://www.piaohua.com/html/dongzuo/2017/0409/31921.html'
					}]
					res.send(template.articleMessage(message))
				} else {
					message.reply = '你说的话：“' + content + '”，我听不懂呀'
					res.send(template.textMessage(message))
				}
			}

		})
	})

});

module.exports = router;