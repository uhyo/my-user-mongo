///<reference path="./node.d.ts" />

type Callback=(err:any,result:any)=>void;

export function connect(url:string,callback:Callback):void{
    var MongoClient:any = require('mongodb').MongoClient;
    MongoClient.connect(url,callback);
};
