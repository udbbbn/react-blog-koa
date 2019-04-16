
/**
 * mongodb
 */
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', function(err){
    console.error("connection error;", error);
});
db.once('open',function(){
  //一次打开记录
  console.log('打开成功')
});


// 文章数据模型
const Article_schema = new mongoose.Schema({
    title: String,
    description: String,
    date: String,
    class: String,
    fileName: String
})
// statics 相当于 prototype
Article_schema.statics = {
    // get博文列表-分页
    fetchList(page, pageNum = 5) {
        return this.find({})
            .skip(page * pageNum)
            .limit(pageNum)
            .sort({'_id': -1})
    },
    // 获取所有博文
    fetchAll() {
        return this.find({})
    },
    // 获取文件名
    fetchFileName(id) {
        return this.find({'_id': id}, {'fileName': 1})
    },
    // 搜索 title description class 
    search(page, pageNum = 5, keyword) {
        const reg = new RegExp(keyword);
        return this.find({})
            .or([{
                'title': { $regex: reg}
            }, {
                'description': { $regex: reg}
            }, {
                'class': { $regex: reg}
            }])
            .skip(page * pageNum)
            .limit(pageNum)
            .sort({'_id': -1})
    },
    // 返回搜索结果长度-用于分页
    searchLength(keyword) {
        const reg = new RegExp(keyword);
        return this.find({})
            .or([{
                'title': { $regex: reg}
            }, {
                'description': { $regex: reg}
            }, {
                'class': { $regex: reg}
            }]).countDocuments();
    },
    // 以下三个操作 不加回调执行不了 不知道为啥
    createData(data) {
        return this.create(data, (err, res) => {})
    },
    updateData(condition, data) {
        return this.updateOne(condition, { "$set": data}, (err, res) => {})
    },
    deleteData(condition) {
        return this.deleteOne(condition, (err, res) => {})
    }
}
/**
 * mongoose 会自动给集合加's'!!!
 * 此处 mongoose.model('Article', Article_schema) 其实映射到mongo里是articles!!
 * 所以集合名要是不带s 读取数据就会一直为空!!!
 */
mongoose.model('Article', Article_schema);
const Article = mongoose.model('Article');

module.exports = Article
