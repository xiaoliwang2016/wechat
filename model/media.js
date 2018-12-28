var Sequelize = require('sequelize')

const Media = global.sequelize.define('media', 
{
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	media_id: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
	},
	local_url : {
		type: Sequelize.STRING,
		allowNull: false
	},
	type : {
		type: Sequelize.STRING,
		allowNull: false
	},
	update_time: {
		type: Sequelize.DATE
	},
	delete_time: {
		type: Sequelize.DATE
	}
},
{
	// 不添加时间戳属性 (updatedAt, createdAt)
	// timestamps: false,
	timeStamps: true,
	
	// 开启软删除，paranoid 只有在启用时间戳时才能工作
	paranoid: true,

  	// 我不想要 createdAt
  	createdAt: false,

	// updatedAt实际被命名为 update_time
	updatedAt: 'update_time',

	deletedAt: 'delete_time',

	// 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
	freezeTableName: true,
})

module.exports = Media