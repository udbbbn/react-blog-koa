
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
    date: String
})
// statics 相当于 prototype
Article_schema.statics = {
    fetchList(page, pageNum = 5) {
        return this.find({})
            .skip(page * pageNum)
            .limit(pageNum)
            .sort({'_id': -1})
    },
    fetchAll() {
        return this.find({})
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
