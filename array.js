const express = require('express');
const server = express();
let ar = [{
    "text": "aText",
    "sender": "aSend",
    "id": 0,
    "addedAt": "23"
},
{
    "text": "bText",
    "sender": "bSend",
    "id": 1,
    "addedAt": "47"
},
{
    "text": "cText",
    "sender": "cSend",
    "id": 2,
    "addedAt": "2"
},
{
    "text": "dText",
    "sender": "dSend",
    "id": 3,
    "addedAt": "18"
}]
console.log('Default ', ar);

function sortAsc(objs, item) {
    return objs.sort((a, b) => (a[item] > b[item]) ? 1 : ((b[item] > a[item]) ? -1 : 0));
}
function sortDesc(objs, item) {
    return objs.sort((a, b) => (a[item] < b[item]) ? 1 : ((b[item] < a[item]) ? -1 : 0));
}
function sortLimit(objs, index) {
    if (index >= 0 & index < 51) return objs.slice(0, index);
}
function sortSkip(objs, index) {
    if (index >= 0 & index < 501) return objs.slice(index);
}
// console.log('Sort addedAt');
// console.log(sortArr(ar, 'addedAt'));
// console.log('Sort id reverse');
// console.log(sortArrReverse(ar, 'id'));
function browserName(ua) {
    if (ua.search(/MSIE/) > -1) return 'Ie';
    if (ua.search(/Trident/) > -1) return 'Iet';
    if (ua.search(/Firefox/) > -1) return 'Firefox';
    if (ua.search(/Opera/) > -1) return 'Opera';
    if (ua.search(/Chrome/) > -1) return 'Chrome';
    if (ua.search(/Safari/) > -1) return 'Safari';
    if (ua.search(/Konqueror/) > -1) return 'Konqueror';
    if (ua.search(/Iceweasel/) > -1) return 'Iceweasel';
    if (ua.search(/SeaMonkey/) > -1) return 'Seamonkey';
};
function browserVersion(ua) {
    let bName = browserName(ua);
    console.log('bName ', bName);
    let arrayUa = ua.split(' ');
    console.log('arrayUa ', arrayUa);
    let bV = '';
    arrayUa.filter((prop)=>{
        if(prop.search(bName) > -1){
            console.log(prop);
            bV = prop;
        } 
    });
    return bV;
};
function userDevice(ua){
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
queryObj = {
    sort: 'addedAt',
    sortValue: 'desc',
    limit: 10,
    skip: 0
}
console.log('Default ', queryObj);
let queryArray = [];
server.get('/messages', (req, res) => {
    console.log(browserName(req.headers['user-agent']));
    console.log('browserVersion ', browserVersion(req.headers['user-agent']));
    console.log(userDevice(req.headers['user-agent']));
    queryArray = Object.keys(req.query);
    console.log('queryArray ', queryArray);
    if (queryArray.length > 0) {
        for (i in queryArray) {
            let id = queryArray[i];
            console.log(queryArray[i], ' = ', req.query[id]);
            if (req.query[id]) queryObj[id] = req.query[id];
        }
        for (i in queryArray) {
            if (queryArray[i] == 'sort') {
                (queryObj['sortValue'] === 'asc') ? ar = sortAsc(ar, queryObj['sort']) : ar = sortDesc(ar, queryObj['sort']);
            }
            if (queryArray[i] == 'limit') {
                ar = sortLimit(ar, queryObj['limit']);
            }
            if (queryArray[i] == 'skip') {
                ar = sortSkip(ar, queryObj['skip']);
            }
        }

    }


    console.log(ar);
    res.send(ar);
    // console.log(req.query.sort);
    // console.log(req.query.sortValue);
    // console.log(Object.keys(req.query));
});

server.listen(3000, (req, res) => {
    console.log('Server start on PORT 3000');
});