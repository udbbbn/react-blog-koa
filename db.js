
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
    // find+limit方案 不适用
    failfetch(id, pageNum = 5, cb) {
        if (id) {
                return this.find({'_id': {'$lt': id}})
                    .limit(pageNum)
                    .sort({'_id': -1})
                    .exec(cb)
        } else { // 首次取数据
            return this.find({})
                .limit(pageNum)
                .sort({'_id': -1})
                .exec(cb)
        }
    },
    fetch(page, pageNum = 5) {
        return this.find({})
            .skip(page * pageNum)
            .limit(pageNum)
            .sort({'_id': -1})
    }
}
/**
 * mongoose 会自动给集合加's'!!!
 * 此处 mongoose.model('Article', Article_schema) 其实映射到mongo里是articles!!
 * 所以集合名要是不带s 读取数据就会一直为空!!!
 */
mongoose.model('Article', Article_schema);
const Article = mongoose.model('Article');

function find(obj) {
    return new Promise((resolve, reject) => {
        Article.find(obj, async function (err, doc) {
            if (err) {
                reject(err)
                return;
            } else {
                resolve(doc)
            }
        })
    })
}

module.exports = Article
