const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const iconvLite = require('iconv-lite')
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
mongoose.connect('mongodb://localhost:27017/spider-fc',{useMongoClient:true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connect db.")
});

const url = 'www.fangdi.com.cn/Presell.asp?projectID=ODM3NnwyMDE4LTQtMjV8NzU=&amp;projectname=%E6%B5%B7%E6%A3%A0%E5%90%8D%E8%8B%91';
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
    no: {
        type: String
    },
    name: {
        type: String
    },
    openDate: {
        type: String
    },
    count: {
        type: String
    },
    area: {
        type: String
    },
    status: {
        type: String
    },
    href: {
        type: String
    },
    pos: {
        type: String
    }
});


var loupan = mongoose.model('fdc_1',infoSchema);




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
            superagent.get(url).set('Cookie', 'ASPSESSIONIDSQDBDDCQ=AEFJDAAAPDLADLLEMOFBEBBD').set('Host','www.fangdi.com.cn')
                .end(function (err, sres) {
                    if (err) {
                        console.log(err);
                        console.log(`抓取错误，正在重新抓取总页数...`);
                        getCount(1, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);

                        let allCount=$('html').find('.page-box').attr('data-total-count');

                        total=allCount/10+(allCount%10>0?1:0);

                        // total = JSON.parse($('.list-wrap .page-box').attr('page-data')).totalPage;
                        console.log('页数:' + total);
                        resolve(total);
                    }
                });
        });
    }

    function getPageInfo(){
        const pageUrl = url;
        console.log('抓取中...' + pageUrl);
        return new Promise(async function (resolve, reject) {
            superagent.get(pageUrl).set('Cookie', 'ASPSESSIONIDSQDBDDCQ=AEFJDAAAPDLADLLEMOFBEBBD').set('Host','www.fangdi.com.cn')
                .set("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
                .set("Accept","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .set("Content-Type", "application/xhtml+xml;charset=utf-8")

        .end(function (err, sres) {
                }).pipe(iconvLite.decodeStream('gb2312')).collect(function (err, sres) {
                if (err) {
                    console.log(`抓取错误`);
                    getInfo(page, total);
                    // return reject(err);
                }
                if(sres){
                    // console.log(iconvLite.decode(new Buffer(sres, 'binary'), 'gb2312'));
                    const $ = cheerio.load(sres);
                    const items = [];
                    $('table').find('tr').each(function (index, element) {
                        if(index==0){
                            return;
                        }
                        const $element = $(element);
                        let no_q;
                        let name_q;
                        let openDate_q;
                        let count_q;
                        let area_q;
                        let status_q;

                        let herf_q;
                        let pos_q;

                        $element.find('td').each(function (index, element) {

                            if(index==0){
                                no_q=$(element).text();
                            }

                            if(index==1){
                                name_q=$(element).find('span').text();
                                herf_q=$(element).find('a').attr('href');
                                // $(element).find('a').attr('onclick').split(',')[1]
                                pos_q=$(element).find('a').attr('onclick').split(',')[1];
                                // let str=$(element).find('a').attr('onclick');
                                // var reg=/"javascript :SetInit('(.*?)')"/g, arr=[], match;
                                // while(match=reg.exec(str))arr.push(match[1]);
                                // console.log(arr); // ["userManager/upPasswordBefore.do", "#", "auditController/getUserAudit.do"]


                            }

                            if(index==2){
                                openDate_q=$(element).text();
                            }
                            if(index==4){
                                count_q=$(element).text();

                            }

                            if(index==6){
                                area_q=$(element).text();
                            }

                            if(index==7){
                                status_q=$(element).text().replace(/(\t)|(\n)|(\s+)/g,'');;
                            }

                        })


                        const $eleInfo = {
                            no: no_q,
                            name: name_q,
                            openDate: openDate_q,
                            count: count_q,
                            area: area_q,
                            status: status_q,
                            herf: herf_q,
                            pos: pos_q
                        };

                        // var _loupan=new loupan($eleInfo);


                        loupan.create($eleInfo, function(error){
                            if(error) {
                                console.log(error);
                            } else {
                                console.log('save ok');
                            }
                            // 关闭数据库链接
                            // db.close();
                        });




                        items.push($eleInfo);
                    });
                    resolve(items);
                }
            });
        })
    }

    async function getCount() {
        // socket.emit('progress', { page: `正在抓取总页数...` });
        // await getPageCount();
        // socket.emit('progress', { page: `抓取到总页数：${total}！` });
        getInfo(1, total);
    }

    async function getInfo(start, total) {
        // for(let i = start;i <= total;i++){
            // socket.emit('progress', { progress: `正在抓取第${i}页...` });
            const pageInfo = await getPageInfo();
        //     // console.log(pageInfo);
        //     socket.emit('progress', { progress: `抓取第${i}页完成！` });
        // }

        console.log('=================== 抓取完成 ===================');
        socket.emit('progress', { progress: `抓取完成！` });
    }

    socket.on('request', function (request) {
        console.log(request);
        loupan.remove({},function (err) {
            if(err) console.log(err);
        });
        getCount();
    });
});

app.get('/api/map', function (req, res) {
    loupan.find({})
        .exec((err, result) => {
            if(err) console.log(err);
            else{
                res.send(JSON.stringify(result));
            }
        })
});

