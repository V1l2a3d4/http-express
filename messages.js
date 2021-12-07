const fs = require('fs');
const { promisifyAll } = require('bluebird');
promisifyAll(fs);
const path = require('path');
const { writeLog, writeRequests } = require('./writeLog.js');
const nunjucks = require('nunjucks');

let messages = [];
let counter = 0;
const log = {};
function browserName(ua) {
    if (ua.search(/MSIE/) > -1) return "Ie";
    if (ua.search(/Trident/) > -1) return "Iet";
    if (ua.search(/Firefox/) > -1) return "Firefox";
    if (ua.search(/Opera/) > -1) return "Opera";
    if (ua.search(/Chrome/) > -1) return "Chrome";
    if (ua.search(/Safari/) > -1) return "Safari";
    if (ua.search(/Konqueror/) > -1) return "Konqueror";
    if (ua.search(/Iceweasel/) > -1) return "Iceweasel";
    if (ua.search(/SeaMonkey/) > -1) return "Seamonkey";
};
function browserVersion(ua) {
    let bName = browserName(ua);
    let arrayUa = ua.split(' ');
    return arrayUa.filter((prop) => {
        if (prop.search(bName) > -1) {
            return prop;
        }
    });
};
function userDevice(ua) {
    if (ua.search(/Android/) > -1) return 'Android';
    if (ua.search(/iPhone/) > -1) return 'iPhone';
    if (ua.search(/iPad/) > -1) return 'iPad';
    if (ua.search(/Symbian/) > -1) return 'Symbian';
    if (ua.search(/Windows Phone/) > -1) return 'Windows Phone';
    if (ua.search(/Tablet OS/) > -1) return 'Tablet OS';
    if (ua.search(/Linux/) > -1) return 'Linux';
    if (ua.search(/Windows NT/) > -1) return 'Windows NT';
    if (ua.search(/Macintosh/) > -1) return 'Macintosh';
}
function sendData(req, res, data) {
    log.startTime = new Date();
    log.headers = req.headers;
    log.method = req.method;
    log.url = req.url;
    res.once('finish', () => {
        log.statusCode = res.statusCode;
        log.endTime = new Date();
        writeLog(log);
    });
    res.once('close', () => {
        log.statusCode = 500;
        writeLog(log);
    });
    res.send(data);
};

function sendFile(req, res, urlFile) {
    log.startTime = new Date();
    log.headers = req.headers;
    log.method = req.method;
    log.url = req.url;
    res.once('finish', () => {
        log.statusCode = res.statusCode;
        log.endTime = new Date();
        writeLog(log);
    });
    res.once('close', () => {
        log.statusCode = 500;
        writeLog(log);
    });
    res.sendFile(urlFile);
};
function sortAsc(objs, item) {
    return objs.sort((a, b) => (a[item] > b[item]) ? 1 : ((b[item] > a[item]) ? -1 : 0));
}
function sortDesc(objs, item) {
    return objs.sort((a, b) => (a[item] < b[item]) ? 1 : ((b[item] < a[item]) ? -1 : 0));
}
function arrayLimit(objs, index) {
    if (index >= 0 & index < 51) return objs.slice(0, index);
}
function arraySkip(objs, index) {
    if (index >= 0 & index < 501) return objs.slice(index);
}
module.exports = {
    connect(server) {
        server.get('/', (req, res) => {
            log.bName = browserName(req.headers['user-agent']);
            log.bVersion = browserVersion(req.headers['user-agent']);
            log.uDevice = userDevice(req.headers['user-agent']);
            const html = nunjucks.render('index.nunjucks', {
                arr: messages,
                urlInfo: '/info'
            });
            sendData(req, res, html);
        });
        let queryObj = {
            sort: 'addedAt',
            sortValue: 'desc',
            limit: 10,
            skip: 0
        }
        let queryArray = [];
        let filePath = '';
        server.get('/:name', async (req, res) => {
            log.bName = browserName(req.headers['user-agent']);
            log.bVersion = browserVersion(req.headers['user-agent']);
            log.uDevice = userDevice(req.headers['user-agent'])
            const fileName = req.params.name;
            if (fileName === 'messages') {
                queryArray = Object.keys(req.query);
                if (queryArray.length > 0) {
                    queryArray.forEach((queryId) => {
                        if (req.query[queryId]) queryObj[queryId] = req.query[queryId];
                    });
                    queryArray.forEach((queryId) => {
                        if (queryId == 'sort') {
                            (queryObj['sortValue'] === 'asc')
                                ? messages = sortAsc(messages, queryObj['sort'])
                                : messages = sortDesc(messages, queryObj['sort']);
                        }
                        if (queryId == 'limit') {
                            messages = arrayLimit(messages, queryObj['limit']);
                        }
                        if (queryId == 'skip') {
                            messages = arraySkip(messages, queryObj['skip']);
                        }
                    });
                }
                sendData(req, res, JSON.stringify(messages));
            } else if (fileName === 'info') {
                const html = nunjucks.render('info.nunjucks', {
                    bName: log.bName,
                    bVersion: log.bVersion,
                    serverTime: new Date(),
                    urlImajes: '/jpg'
                });
                sendData(req, res, html);
            } else
                if (path.extname(fileName) === 'jpg' || 'png' || 'mp4' || 'ICO') {
                    filePath = path.join(__dirname, fileName);
                    const isFileExists = fs.existsSync(filePath);
                    if (!isFileExists) {
                        const fileList = await fs.readdirAsync(__dirname);
                        const fileExists = fileList.find(el => path.extname(el) === `.${fileName}`);
                        if (!fileExists) {
                            res.statusCode = 404;
                            sendData(req, res, '404');
                        } else {
                            sendFile(req, res, path.join(__dirname, fileExists));
                        }
                    }
                }
        });
        setInterval(() => {
            writeRequests(log);
        }, 60000);
        server.post('/messages', (req, res) => {
            messages.push({ id: counter++, ...req.body, addedAt: new Date() });
            sendData(req, res, JSON.stringify(messages));
        });
    }
}