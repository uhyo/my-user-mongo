///<reference path="./node.d.ts" />
///<reference path="./util.d.ts" />
///<reference path="../node_modules/my-user/lib.d.ts" />
var extend = require('extend');
var randomstring = require('random-string');
var myuser = require('my-user');
exports.User = myuser.User;
exports.UserConfig = myuser.UserConfig;
function init() {
    //TODO
    return myuser.init();
}
exports.init = init;
//UserDoc -> User
function load(userconfig, doc) {
    if (doc == null) {
        return null;
    }
    var result = userconfig.create();
    if (doc.data == null) {
        doc.data = {};
    }
    doc.data._id = doc._id;
    result.loadRawData(doc);
    return result;
}
exports.load = load;
//User -> UserDoc
function toDoc(user) {
    if (user == null) {
        return null;
    }
    //TODO
    var data = user.getData();
    var result = {
        _id: data._id,
        id: user.id,
        version: user.version,
        salt: user.salt,
        password: user.password,
        data: data
    };
    return result;
}
exports.toDoc = toDoc;
//User manager
var Manager = (function () {
    function Manager(userconfig, db, collection, options) {
        this.userconfig = userconfig;
        this.db = db;
        this.collection = collection;
        this.options = options;
    }
    //
    //low level user manipulation
    Manager.prototype.findOneUser = function (query, callback) {
        var _this = this;
        this.db.collection(this.collection, function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            coll.findOne(query, function (err, doc) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, load(_this.userconfig, doc));
            });
        });
    };
    Manager.prototype.findUsers = function (query, arg2, arg3) {
        var _this = this;
        var options, callback;
        if ("function" === typeof arg2) {
            options = {}, callback = arg2;
        }
        else {
            options = arg2, callback = arg3;
        }
        this.db.collection(this.collection, function (err, coll) {
            if (err) {
                callback(err, null);
                return;
            }
            coll.find(query, options).toArray(function (err, docs) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, docs.map(function (doc) {
                    return load(_this.userconfig, doc);
                }));
            });
        });
    };
    Manager.prototype.createNewUser = function (data, callback) {
        var _this = this;
        //generate random user id
        var t = this;
        generate(function (id) {
            //new id is found
            var u = _this.userconfig.create(id);
            u.setData(data);
            //save
            _this.db.collection(_this.collection, function (err, coll) {
                if (err) {
                    callback(err, null);
                    return;
                }
                coll.insertOne(toDoc(u), function (err, result) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    //TODO
                    data = extend(true, data, {
                        _id: result.insertedId
                    });
                    u.setData(data);
                    callback(null, u);
                });
            });
        });
        function generate(callback2) {
            var id = randomstring({ length: t.options.userIdLength });
            t.findOneUser({
                id: id
            }, function (err, user) {
                if (err) {
                    callback(null, null);
                    return;
                }
                if (user != null) {
                    //this id already exists
                    generate(callback2);
                    return;
                }
                callback2(id);
            });
        }
    };
    return Manager;
})();
exports.Manager = Manager;
