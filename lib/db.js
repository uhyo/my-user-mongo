///<reference path="./node.d.ts" />
function connect(url, callback) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(url, callback);
}
exports.connect = connect;
;
