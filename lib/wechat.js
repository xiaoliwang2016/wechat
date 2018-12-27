const wxConfig = require('../config/wx.js')
const fs = require('fs')
const sha1 = require('sha1')
const request = require('request')

var accessTokenHandler = {
	appId: wxConfig.appId,
	appSecret: wxConfig.appSecret,
	token: wxConfig.token
}

accessTokenHandler.getAccessToken = function(){
	var access_token = fs.readFileSync('./accessToken.txt')
}

accessTokenHandler.updateAccessToken = function(){

	const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`

	// 返回accesstoken格式如下
	// {
	// 	"access_token":"string",
	// 	"expires_in":7200
	// }

	request(url, function(err, response, body){
		console.log(response.body)
	})
}


const wechat = function(req, res, next) {
	var token = wxConfig.token
	var signature = req.query.signature
	var nonce = req.query.nonce
	var timestamp = req.query.timestamp
	var echostr = req.query.echostr
	var str = [token, timestamp, nonce].sort().join('')
	var sha = sha1(str)

	if (sha === signature) {
		accessTokenHandler.updateAccessToken()
		next()
	}else{
		res.send('error')
	}

};

module.exports = wechat
