const Koa = require('koa');
const app = new Koa();
const Router = require("koa-router");
const fs = require('fs');
const chokidar = require('chokidar');
const cors = require('koa2-cors');
const Article = require('./db'); 


/**
 * markdown编译
 */
const markdown = require('marked');
markdown.setOptions({
    langPrefix:"hljs ",
    highlight: function (code, lang) {
        return require('highlight').Highlight(code, [lang]).value
    }
})




/**
 * md文件夹监听
 */
chokidar.watch('./md', {
    persistent: true, // 是否保护进程不退出持久监听
    cwd: '.', // 表示当前目录
    ignored: '/', // 要忽略监听的文件(夹)
    ignoreInitial: true, // 是否对增加文件(夹)的时候发送事件 false 会触发
    // 经测试 只是启动服务时的首次文件遍历 是否发送事件
    usePolling: false, // 是否使用fs.watchFile 轮询
    // depth: number 递归监听number个子目录
}).on('all', (event, path) => { // 监听除了ready, raw, and error之外所有的事件类型
    console.log(event, path);
})


const router = new Router();
// 获取指定文章
router.get('/blogDetail/:id', async (ctx, next) => {
    const id = ctx.params.id;
    const data = await Article.fetchFileName(id);
    ctx.response.body = mdRender(await readMd(data[0]._doc.fileName));
})
// 获取文章列表 -- find+limit 分页
router.get('/blogDetail', async (ctx, next) => {
    const data = await Article.fetchList(Number(ctx.query.page), Number(ctx.query.pageSize));
    const count = await Article.countDocuments();
    const res = {
        code: 200,
        data: data,
        count: count
    }
    ctx.response.body = res;
})
// 获取文章分类
router.get('/class', async(ctx, next) => {
    let data = await Article.fetchAll();
    const count = await Article.countDocuments();
    data = calcCalssNum(data);
    const res = {
        code: 200,
        data: data,
        count: count
    }
    ctx.response.body = res;
})

// 计算分类的数量
function calcCalssNum(arr) {
    let obj = {};
    arr.map(el => {
        if (!obj[el._doc.class]) {
            obj[el._doc.class] = {
                count: 1,
                children: [],
                target: el._doc.class
            }
            obj[el._doc.class].children.push(el._doc)
        } else {
            ++obj[el._doc.class].count
            obj[el._doc.class].children.push(el._doc)
        }
    });
    return obj
}

/**
 * 
 * @param {string} id 文件名(id)
 */
async function readMd(id) {
    const file = await readFile(`./md/${id}.md`);
    handleKey(file.toString())
    const res = file.toString().split('-----')[1]
    return res;
}

/**
 * 处理title description date
 * @param {string} file makedown文件内容
 */
function handleKey(file) {
    const reg = /(?:title:|descrption:|date:|class:)(.*)/g;
    const resArr = file.match(reg);
    let sqlObj = {};
    resArr.map(el => {
        const temp = el.split(': ');
        sqlObj[temp[0]] = temp[1];
    });
    console.log(JSON.stringify(sqlObj))
}

/**
 * 
 * @param {string} fileName  需要读取文件的文件名
 */
function readFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

/**
 * 
 * @param {string} str makedown原文
 */
function mdRender(str) {
    return markdown(str)
}


app.use(async (ctx, next) => {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
    await next();
});

app
    .use(cors({
        origin: '*'
    }))
    .use(router.routes())
    .use(router.allowedMethods())
  

app.listen(3000, () => {
    console.log('server start at http://localhost:3000!');
});