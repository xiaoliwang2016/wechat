var express = require('express')
var path = require('path')
var router = express.Router()
var multer = require('multer')
//uuid工具可以生成唯一标示 需要安装
var UUID = require('uuid')
var request = require('request')
var fs = require('fs')

const MediaModel = require('../model/media')


var baseApi = `https://api.weixin.qq.com/cgi-bin/media/upload`

//设置保存规则
var storage = multer.diskStorage({
	//destination：字段设置上传路径，可以为函数
	destination: path.resolve(__dirname, '../upload'),

	//filename：设置文件保存的文件名
	filename: function(req, file, cb) {
		let extName = file.originalname.slice(file.originalname.lastIndexOf('.'))
		let fileName = UUID.v1()
		cb(null, fileName + extName)
	}
})

//设置过滤规则（可选）
var imageFilter = function(req, file, cb){
	var acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
	//微信公众号只接收上述四种类型的图片
	if(acceptableMime.indexOf(file.mimetype) !== -1){
		cb(null, true)
	}else{
		cb(null, false)
	}
}

//设置限制（可选）
var imageLimit = {
	fieldSize: '2MB'
}

//创建 multer 实例
var imageUploader = multer({ 
	storage: storage,
	fileFilter: imageFilter,
	limits: imageLimit
}).array('photos', 12)	//定义表单字段、数量限制

var videoFilter = function(req, file, cb){
	var acceptableMime = ['video/mp4']
	//微信公众号只接收上述四种类型的图片
	if(acceptableMime.indexOf(file.mimetype) !== -1){
		cb(null, true)
	}else{
		cb(null, false)
	}
}

var videoUploader = multer({ 
	storage: storage,
	fileFilter: videoFilter,
	limits: {
		fieldSize: '10MB'
	}
}).array('video', 10)

router.post('/image', imageUploader, function(req, res, next) {
	var api = `${baseApi}?access_token=${global.accessToken}&type=image`
	req.files.forEach(file => {
		var formData = {
			media: fs.createReadStream(file.path)
		}
		request.post({url: api, formData: formData}, function(err,response,body){
			if(err) {
				console.log('上传图片失败' , err);
				return
			}
			let data = {
				media_id: JSON.parse(response.body).media_id,
				local_url: path.join(path.resolve(__dirname, '../upload'), file.filename),
				type: 'image'
			}
			MediaModel.create(data).then(res => {
				console.log(`保存图片${res.dataValues.media_id}成功`);
			})
		})
	})
})

router.post('/video', videoUploader, function(req, res, next) {
	console.log(req.files);
})


module.exports = router