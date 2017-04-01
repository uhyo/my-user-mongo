import extend=require('extend');

import user=require('./user');

import {
    Callback,
} from './util';

export import User=user.User;
export import UserConfig=user.UserConfig;
export import UserDoc=user.UserDoc;
import UserCallback=user.UserCallback;

export interface ManagerOptions{
    db?:any;
    url?:string;
    collection?:{
        user?:string;
    };

    user: user.ManagerOptions;
}

export interface EntryResult{
    user:User;
}

export class Manager{
    public userconfig:UserConfig;
    private db:any;
    private collection:{
        user:string;
    };
    private options:ManagerOptions;

    public user:user.Manager;

    constructor(options:ManagerOptions){
        this.options=extend(true,{
            collection:{
                user:"user"
            }
        },options);
        this.userconfig=user.init();
    }

    //initialize
    init(callback: Callback<any>):void{
        const options=this.options;
        //Error check
        if(options.db==null && options.url==null){
            throw new Error("Neither Db instance nor connection url is given.");
        }
        if(options.db==null && callback==null){
            throw new Error("Callback function is required when connection url is specified.");
        }

        //Read options
        this.collection = {
            user: options.collection!.user!
        };

        //Connect to db
        if(options.db!=null){
            //already active db is given
            this.db=options.db;
            this.initComponents();
            if(callback){
                callback(null,options.db);
            }
        }else {
            //newly connect
            require('./db').connect(options.url,(err,db)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                this.db=db;
                this.initComponents();
                callback(null,db);
            });
        }
    }
    private initComponents():void{
        //db
        this.user=new user.Manager(this.userconfig,this.db,this.collection.user,this.options.user);
    }
    //high level user manipulation
    entry(data:any, callback:(err, result:EntryResult | null)=>void):void{
        this.user.createNewUser(data,(err,u:User)=>{
            if(err){
                callback(err, null);
                return;
            }
            callback(null, {
                user:u
            });
        });
    }
}
