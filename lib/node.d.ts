declare var require:(path:string)=>any;

declare module "extend"{
    function extend(...args:any[]):any;
    export = extend;
}
declare module "random-string"{
    function randomString(option?:{
        length?:number;
        numeric?:boolean;
        letters?:boolean;
        special?:boolean;
    }):string;
    export = randomString;
}

interface ObjectId{
    equal(a:ObjectId):boolean;
}
