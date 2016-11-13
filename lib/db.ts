export function connect(url:string,callback:Callback):void{
    var MongoClient:any = require('mongodb').MongoClient;
    MongoClient.connect(url,callback);
};
