// Callback types definition
declare type Callback=(err:any,result?:any)=>void;

// MongoDB ObjectId
interface ObjectId{
    equal(a:ObjectId):boolean;
}
