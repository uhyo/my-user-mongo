///<reference path="./node.d.ts" />
///<reference path="./util.d.ts" />
///<reference path="../node_modules/my-user/lib.d.ts" />

import extend=require('extend');
import randomstring=require('random-string');
import myuser=require('my-user');

export import User=myuser.User;
export import UserConfig=myuser.UserConfig;

export type UserCallback=(err:any,user:User)=>void;
export type UsersCallback=(err:any,users:Array<User>)=>void;

export interface UserDoc{
    _id:ObjectId;
    id:string;
    version:number;
    salt:string;
    password:string;
    data:any;
}


export function init():UserConfig{
    //TODO
    return (<any>myuser).init();
}

//UserDoc -> User
export function load(userconfig:UserConfig,doc:UserDoc):User{
    if(doc==null){
        return null;
    }
    var result=userconfig.create();
    if(doc.data==null){
        doc.data={};
    }
    doc.data._id=doc._id;
    result.loadRawData(doc);
    return result;
}

//User -> UserDoc
export function toDoc(user:User):UserDoc{
    if(user==null){
        return null;
    }
    //TODO
    var data=user.getData();
    var result:UserDoc={
        _id: data._id,
        id:user.id,
        version:user.version,
        salt:user.salt,
        password:user.password,
        data:data
    };
    return result;
}

export interface ManagerOptions{
    //user id length
    userIdLength?:number;
}

//User manager
export class Manager{
    constructor(private userconfig:UserConfig,private db:any,private collection:string,private options:ManagerOptions){
    }
    //
    //low level user manipulation
    findOneUser(query:any,callback:UserCallback):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.findOne(query,(err,doc:UserDoc)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                callback(null,load(this.userconfig,doc));
            });
        });
    }
    findUsers(query:any,callback:UsersCallback):void;
    findUsers(query:any,options:any,callback:UsersCallback):void;
    findUsers(query:any,arg2:any,arg3?:any):void{
        var options:any, callback:UsersCallback;
        if("function"===typeof arg2){
            options={}, callback=arg2;
        }else{
            options=arg2, callback=arg3;
        }

        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.find(query,options).toArray((err,docs:Array<UserDoc>)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                callback(null,docs.map((doc)=>{
                    return load(this.userconfig,doc);
                }));
            });
        });
    }
    createNewUser(data:any,callback:UserCallback):void{
        //generate random user id
        var t=this;
        generate((id:string)=>{
            //new id is found
            var u=this.userconfig.create(id);
            u.setData(data);
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
                        _id:result.insertedId
                    });
                    callback(null,u);
                });
            });
        });
        function generate(callback2:(id:string)=>void):void{
            var id=randomstring({length: t.options.userIdLength});
            t.findOneUser({
                id:id
            },(err,user:User)=>{
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
    saveUser(u:User,callback:Callback):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.updateOne({id:u.id},toDoc(u),callback);
        });
    }
    deleteUser(u:User,callback:Callback):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.deleteOne({id:u.id},callback);
        });
    }

    //are
    existsUser(userid:string,callback:Callback):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            coll.findOne({id:userid},{id:1},(err,doc)=>{
                callback(err, doc!=null);
            });
        });
    }
}
