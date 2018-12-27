const wxConfig = require('../config/wx.js')
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const request = require('request')

var accessTokenHandler = {
	appId: wxConfig.appId,
	appSecret: wxConfig.appSecret,
	token: wxConfig.token
}

accessTokenHandler.getAccessToken = function(){
	var data = fs.readFileSync(path.resolve(__dirname, './token.txt'))
	try{
		accessToken = JSON.parse(data)
		if(accessToken.expires_in > Date.parse(new Date())){
			return accessToken.access_token
		}else{
			//已过期
			this.updateAccessToken()
		}
	}
	catch(err){
		//文件为空
		this.updateAccessToken()
	}
}

accessTokenHandler.updateAccessToken = function(){
	const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
	// 返回accesstoken格式如下
	// {
	// 	"access_token":"string",
	// 	"expires_in":7200
	// }
	request(url, function(err, response, body){
		var accessToken = response.body
		accessToken['expires_in'] = Date.parse(new Date())+((7200 - 20)*1000)
		fs.writeFileSync(path.resolve(__dirname, './token.txt') , JSON.stringify(accessToken))
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
		accessTokenHandler.getAccessToken()
		next()
	}else{
		res.send('error')
	}

};

module.exports = wechat
