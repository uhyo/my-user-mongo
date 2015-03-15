///<reference path="./node.d.ts" />
///<reference path="./util.d.ts" />
///<reference path="../node_modules/my-user/lib.d.ts" />

import extend=require('extend');
import randomstring=require('random-string');
import myuser=require('my-user');

export import User=myuser.User;
export import UserConfig=myuser.UserConfig;

export type UserCallback=(err:any,user:User)=>void;

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
    userIdLength:number;
}

interface FindOneUserQuery{
    id?:string;
}

//User manager
export class Manager{
    constructor(private userconfig:UserConfig,private db:any,private collection:string,private options:ManagerOptions){
    }
    //
    //low level user manipulation
    findOneUser(query:FindOneUserQuery,callback:UserCallback):void{
        this.db.collection(this.collection,(err,coll)=>{
            if(err){
                callback(err,null);
                return;
            }
            //make query
            var q:any={};
            if(query.id!=null){
                q.id=query.id;
            }
            coll.findOne(q,(err,doc:UserDoc)=>{
                if(err){
                    callback(err,null);
                    return;
                }
                callback(null,load(this.userconfig,doc));
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

                    //TODO
                    data=extend(true,data,{
                        _id:result.insertedId
                    });
                    u.setData(data);
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


}