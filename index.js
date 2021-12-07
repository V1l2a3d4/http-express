const express = require('express');
const PORT = process.env.PORT || 3000;
const server = express();
const path = require('path');
const nunjucks = require('nunjucks');
const templatesDir = path.join(__dirname, 'templates');

server.use(express.urlencoded());
server.use(express.json());
nunjucks.configure(templatesDir, {
    express: server
});
require('./messages').connect(server);

server.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});
