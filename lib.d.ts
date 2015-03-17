///<reference path="./node_modules/my-user/lib.d.ts" />
declare module "my-user-mongo" {
    import myuser=require('my-user');

    export import User=myuser.User;
    export import UserConfig=myuser.UserConfig;

    export function manager(options:ManagerOptions):Manager;

    type Callback=(err:any,result:any)=>void;
    type UserCallback=(err:any,user:User)=>void;
    type UsersCallback=(err:any,users:Array<User>)=>void;

    export interface ManagerOptions{
        db?:any;
        url?:string;
        collection?:{
            user?:string;
        };

        user?:UserManagerOptions;
    }
    interface UserManagerOptions{
        userIdLength?:number;
    }

    
    export class Manager{
        user:UserManager;

        constructor(options:ManagerOptions);
        init(callback:Callback):void;

        entry(data:any,callback:Callback):void;
    }

    class UserManager{
        constructor(userconfig:UserConfig,db:any,collection:string,options:UserManagerOptions);
        findOneUser(query:any,callback:UserCallback):void;
        findUsers(query:any,callback:UsersCallback):void;
        findUsers(query:any,options:any,callback:UsersCallback):void;
        createNewUser(data:any,callback:UserCallback):void;
        saveUser(u:User,callback:Callback):void;
        deleteUser(u:User,callback:Callback):void;
        existsUser(userid:string,callback:(err:any,result:boolean)=>void):void;
    }
}
