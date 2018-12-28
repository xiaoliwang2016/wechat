const wxConfig = require('../config/wx.js')
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const request = require('request')

function Wechat(){
	this.appId = wxConfig.appId,
	this.appSecret = wxConfig.appSecret,
	this.token = wxConfig.token
}

Wechat.prototype.init = function(req, res, next) {
	var token = wxConfig.token
	var signature = req.query.signature
	var nonce = req.query.nonce
	var timestamp = req.query.timestamp
	var echostr = req.query.echostr
	var str = [token, timestamp, nonce].sort().join('')
	var sha = sha1(str)

	if (sha === signature) {
		next()
	}else{
		res.send('error')
	}

};

Wechat.prototype.getAccessToken = function(){
	var data = fs.readFileSync(path.resolve(__dirname, './token.txt'))
	try{
		accessToken = JSON.parse(data)
		if(accessToken.expires_in > Date.parse(new Date())){
			return Promise.resolve(accessToken.access_token)
		}else{
			//已过期
			return this.updateAccessToken()
		}
	}
	catch(err){
		//文件为空
		return this.updateAccessToken()
	}
}

Wechat.prototype.updateAccessToken = function(){
	const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
	// 返回accesstoken格式如下
	// {
	// 	"access_token":"string",
	// 	"expires_in":7200
	// }
	return new Promise((resolve, reject) => {
		request(url, function(err, response, body){
			var accessToken = JSON.parse(response.body)
			accessToken['expires_in'] = Date.parse(new Date())+((7200 - 20)*1000)
			fs.writeFileSync(path.resolve(__dirname, './token.txt') , JSON.stringify(accessToken))
			resolve(accessToken.access_token)
		})		
	})
}


module.exports = new Wechat()
