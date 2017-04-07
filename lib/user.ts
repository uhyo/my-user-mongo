import randomstring=require('random-string');
import * as myuser from 'my-user';

import {
    ObjectID,
    Db,
} from 'mongodb';

import {
    Callback,
} from './util';

export import User = myuser.User;
export import UserConfig = myuser.UserConfig;
export import UserConfigOptions = myuser.UserConfigOptions;

export type UserCallback<T> = (err:any, user:User<T> | null)=>void;
export type UsersCallback<T> = (err:any, users:Array<User<T>> | null)=>void;

export interface UserDoc<T extends object>{
    _id:ObjectID;
    id:string | null;
    version:number;
    salt:string;
    password:string;
    data: T;
}

export type UserData<T> = T & {
    _id: ObjectID;
};


export function init(options?: Partial<UserConfigOptions>):UserConfig{
    //TODO
    return myuser.init(options);
}

//UserDoc -> User
export function load<T extends object>(userconfig:UserConfig, doc: null): null;
export function load<T extends object>(userconfig:UserConfig, doc:UserDoc<T>): User<UserData<T>>;
export function load<T extends object>(userconfig:UserConfig, doc:UserDoc<T> | null): User<UserData<T>> | null{
    if(doc==null){
        return null;
    }
    const result = userconfig.create<UserData<T>>();
    result.loadRawData({
        ...doc,
        data: {
            ... (doc.data as object),
            _id: doc._id,
        } as UserData<T>,
    });
    return result;
}

//User -> UserDoc
export function toDoc<T extends Object>(user: null): null;
export function toDoc<T extends object>(user:User<UserData<T>>): UserDoc<T>;
export function toDoc<T extends object>(user:User<UserData<T>> | null): UserDoc<T> | null{
    if(user==null){
        return null;
    }
    //TODO
    const data = user.getData();
    const result: UserDoc<T> = {
        _id: data._id,
        id:user.id,
        version:user.version,
        salt:user.salt,
        password:user.password,
        data,
    };
    return result;
}

export interface ManagerOptions{
    //user id length
    userIdLength?:number;
}

//User manager
export class Manager<T extends object>{
    constructor(private userconfig:UserConfig, private db: Db, private collection:string, private options:ManagerOptions){
    }
    //
    //low level user manipulation
    findOneUser(query:any,callback:UserCallback<UserData<T>>):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err, null);
                return;
            }
            coll.findOne(query,(err, doc:UserDoc<T>)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                callback(null,load(this.userconfig,doc));
            });
        });
    }
    findUsers(query:any, callback:UsersCallback<UserData<T>>): void;
    findUsers(query:any, options:any, callback:UsersCallback<UserData<T>>): void;
    findUsers(query:any, arg2:any, arg3?:any): void{
        let options:any, callback:UsersCallback<UserData<T>>;
        if("function"===typeof arg2){
            options={}, callback=arg2;
        }else{
            options=arg2, callback=arg3;
        }

        this.db.collection(this.collection, (err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.find(query,options).toArray((err,docs:Array<UserDoc<T>>)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                callback(null, docs.map((doc)=>{
                    return load(this.userconfig, doc) as User<UserData<T>>;
                }).filter(u=> u != null));
            });
        });
    }
    createNewUser(data: T, callback:UserCallback<UserData<T>>):void{
        //generate random user id
        var t=this;
        generate((id:string)=>{
            //new id is found
            const u = this.userconfig.create<UserData<T>>(id);
            u.setData({
                ... (data as any),
                _id: null as any,
            } as UserData<T>);
            //save
            this.db.collection(this.collection,(err,coll)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                coll.insertOne(toDoc(u),(err,result)=>{
                    if(err){
                        callback(err,null);
                        return;
                    }

                    u.writeData({
                        _id:result.insertedId,
                    } as any);
                    callback(null,u);
                });
            });
        });
        function generate(callback2:(id:string)=>void):void{
            const id = randomstring({length: t.options.userIdLength});
            t.findOneUser({
                id:id
            }, (err,user: User<UserData<T>>)=>{
                if(err){
                    callback(null,null);
                    return;
                }

                if(user!=null){
                    //this id already exists
                    generate(callback2);
                    return;
                }
                callback2(id);
            });
        }
    }
    saveUser(u: User<UserData<T>>,callback:Callback<any>):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.updateOne({id:u.id},toDoc(u),callback);
        });
    }
    deleteUser(u: User<UserData<T>>, callback:Callback<any>):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.deleteOne({id:u.id},callback);
        });
    }

    //are
    existsUser(userid:string, callback:Callback<boolean>):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.findOne({id:userid},{
                fields: {id:1},
            }, (err,doc)=>{
                callback(err, doc!=null);
            });
        });
    }
}
