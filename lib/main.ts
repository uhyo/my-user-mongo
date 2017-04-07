import extend=require('extend');

import {
    Db,
} from 'mongodb';

import {
    User,
    UserConfig,
    UserDoc,
    UserData,
    Manager as UserManager,
    ManagerOptions as UserManagerOptions,
    init as userInit,
} from './user';
import {
    connect,
} from './db';

import {
    Callback,
} from './util';

export {
    User,
    UserConfig,
    UserDoc,
    UserData,
};

export interface ManagerOptions{
    db?: Db;
    url?:string;
    collection?:{
        user?:string;
    };

    user: UserManagerOptions;
}

export interface EntryResult<T>{
    user: User<UserData<T>>;
}

export class Manager<T extends object>{
    public userconfig:UserConfig;
    private db:any;
    private collection:{
        user:string;
    };
    private options:ManagerOptions;

    public user: UserManager<T>;

    constructor(options: ManagerOptions){
        this.options = extend(true,{
            collection:{
                user:"user",
            }
        },options);
        this.userconfig = userInit();
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
            connect(options.url!,(err,db)=>{
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
        this.user=new UserManager(this.userconfig,this.db,this.collection.user,this.options.user);
    }
    //high level user manipulation
    entry(data: T, callback:(err: any, result:EntryResult<T> | null)=>void):void{
        this.user.createNewUser(data,(err,u:User<UserData<T>>)=>{
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
