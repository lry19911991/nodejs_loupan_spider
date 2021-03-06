const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const app = express();

//socket.io
let server = require('http').Server(app);
let io = require('socket.io')(server);

//中间件
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));// for parsing application/json
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded

server.listen(1080, function () {
    console.log('listening *:80');
});



const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/spider-lj',{useMongoClient:true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connect db.")
});

// const url = 'http://sh.loupan.com/xinfang/t1';

let url;

const httphead='http://'

const httpDed='.loupan.com/xinfang/t1'

let total = 0;

// //模型
// const loupan = mongoose.model('loupan',{
//     src: String,
//     name: String,
//     // discount: String,
//     where: String,
//     area: String,
//     tags: [String],
//     types: [String],
//     price: String,
//     href: String
// });
var Schema = mongoose.Schema;


var infoSchema = new Schema({
    src: {
        type: String
    },
    name: {
        type: String
    },
    where: {
        type: String
    },
    area: {
        type: String
    },
    tags: {
        type: [String]
    },
    types: {
        type: [String]
    },
    price: {
        type: String
    },
    href: {
        type: String
    }
});


var loupan = mongoose.model('1_1_3_sh_loupan_',infoSchema);




app.get('/', function (req, res) {
    res.sendfile(__dirname + '/build/index.html');
});

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

io.on('connection', (socket) => {

    function getPageCount(){
        console.log('抓取总页数...' + url);
        return new Promise(function (resolve, reject) {
            superagent.get(url)
                .end(function (err, sres) {
                    if (err) {
                        console.log(err);
                        console.log(`抓取错误，正在重新抓取总页数...`);
                        getCount(1, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);

                         total=$('html').find('.pagenxt').prev().text();

                        // total=allCount/10+(allCount%10>0?1:0);

                        // total = JSON.parse($('.list-wrap .page-box').attr('page-data')).totalPage;
                        console.log('页数:' + total);
                        resolve(total);
                    }
                });
        });
    }

    function getPageInfo(page){
        const pageUrl = page===1?url:`${url}-p${page}/`;
        console.log('抓取中...' + pageUrl);
        return new Promise(function (resolve, reject) {
            superagent.get(pageUrl)
                .end(function (err, sres) {
                    if (err) {
                        console.log(`抓取错误，正在从失败页(${page})继续...`);
                        getInfo(page, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);
                        const items = [];
                        $('#house_list .f-dh').each(function (index, element) {
                            let tagArr = [];
                            let typeArr = [];
                            const $element = $(element);
                            const $img = $element.find("img");
                            const $info_1 = $element.find(".info .title a").text().replace(/(\t)|(\n)|(\s+)/g,'');
                            // const $info_2 = $element.find(".info .title a").replace(/(\t)|(\n)|(\s+)/g,'');

                            $element.find('.info .u-attr i').each(function (i, item) {
                                tagArr[i] = $(item).text().replace(/(\t)|(\n)|(\s+)/g,'');
                            });

                            $element.find('.info .type a').each(function (i, item) {
                                typeArr[i] = $(item).text().replace(/(\t)|(\n)|(\s+)/g,'');
                            });

                            const $eleInfo = {
                                src: $img.attr('src'),
                                name: $info_1,
                                // discount: $info_1.find('h2 .redTag .text').text(),
                                where: $element.find(".info .add a").text().replace(/(\t)|(\n)|(\s+)/g,''),
                                area: $element.find(".info .type").text().replace(/(\t)|(\n)|(\s+)/g,''),
                                tags: tagArr,
                                types: typeArr,
                                price: $element.find(".guide .price").text().replace(/(\t)|(\n)|(\s+)/g,''),
                                href: "http://sh.loupan.com"+$element.find('a').first().attr('href')
                            };

                            // var _loupan=new loupan($eleInfo);
                            // console.log($info_1.find('a').text());


                            loupan.create($eleInfo, function(error){
                                if(error) {
                                    console.log(error);
                                } else {
                                    // console.log('save ok');
                                }
                                // 关闭数据库链接
                                // db.close();
                            });

                            // var criteria = {}; // 查询条件
                            // var fields   = {src : 1, name : 1, where : 1}; // 待返回的字段
                            // var options  = {};
                            // loupan.find(criteria, fields, options, function(error, result){
                            //     if(error) {
                            //         console.log(error);
                            //     } else {
                            //         console.log(result);
                            //     }
                            //     //关闭数据库链接
                            //     // db.close();
                            // });


                            // _loupan.save(function (err, user) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         console.log(err);
                            //     }
                            // });

                            // loupan.create($eleInfo, function (err) {
                            //     if(err) console.log(err);
                            // });
                            items.push($eleInfo);
                        });
                        resolve(items);
                    }
                });
        })
    }

    async function getCount() {

        socket.emit('progress', { page: `正在抓取总页数...` });
        await getPageCount();
        socket.emit('progress', { page: `抓取到总页数：${total}！` });
        getInfo(1, total);
    }

    async function getInfo(start, total) {
        total>11?total=11:total;
        for(let i = start;i <= total;i++){
            socket.emit('progress', { progress: `正在抓取第${i}页...` });
            const pageInfo = await getPageInfo(i);
            // console.log(pageInfo);
            socket.emit('progress', { progress: `抓取第${i}页完成！` });
        }

        console.log('=================== 抓取完成 ===================');
        socket.emit('progress', { progress: `抓取完成！` });
    }

    socket.on('request', function (request) {
        url=httphead+request+httpDed;
        loupan=mongoose.model('lp__2018_'+request+'_loupan_',infoSchema);
        loupan.remove({},function (err) {
            if(err) console.log(err);
        });
        getCount();
    });
});

app.get('/api/map', function (req, res) {
    loupan=mongoose.model('lp__2018_'+req.query.cityCode+'_loupan_',infoSchema);
    loupan.find({})
        .exec((err, result) => {
            if(err) console.log(err);
            else{
                res.send(JSON.stringify(result));
            }
        })
});

