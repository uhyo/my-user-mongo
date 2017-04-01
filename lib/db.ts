import {
    MongoClient,
} from 'mongodb';
import {
    Callback,
} from './util';

export function connect(url:string, callback: Callback<any>):void{
    MongoClient.connect(url,callback);
};
