const path = require("path");
const logPath = path.join(__dirname, "log.txt");
const requestPath = path.join(__dirname, "requestLog.txt");
const fs = require("fs");
const { promisifyAll } = require('bluebird');
promisifyAll(fs);
let requests = [];
let count = 0;

const writeLog = async (log) => {
    ++count;
    log.spentTime = log.endTime.getTime() - log.startTime.getTime();

    const logStr = `${log.method} ${log.url} ${
        log.startTime.getTime()}-${log.endTime.getTime()} (${log.spentTime}) ${log.statusCode}`;
    requests.push(log);
    try {
        await fs.appendFileAsync(logPath, `${logStr}\n`, "utf8", err => {
            if (err) return err;
        });
    } catch (err) {
        console.log(err);
    }
}
const writeRequests = async (log) => {
    try {
        await fs.appendFileAsync(requestPath,
            `User OS: ${log.uDevice}\n 
            Browser Name: ${log.bName}\n 
            Browser Version: ${log.bVersion}\n
            Starus code: ${log.statusCode}\n`,
            "utf8",
            err => {
                if (err) return err;
            });
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    writeLog,
    writeRequests
};
