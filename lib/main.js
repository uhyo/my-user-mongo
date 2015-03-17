///<reference path="./node.d.ts" />
///<reference path="./util.d.ts" />
///<reference path="../node_modules/my-user/lib.d.ts" />
var extend = require('extend');
var user = require('./user');
exports.User = user.User;
exports.UserConfig = user.UserConfig;
var Manager = (function () {
    function Manager(options) {
        this.options = extend(true, {
            collection: {
                user: "user"
            }
        }, options);
        this.userconfig = user.init();
    }
    //initialize
    Manager.prototype.init = function (callback) {
        var _this = this;
        var options = this.options;
        //Error check
        if (options.db == null && options.url == null) {
            throw new Error("Neither Db instance nor connection url is given.");
        }
        if (options.db == null && callback == null) {
            throw new Error("Callback function is required when connection url is specified.");
        }
        //Read options
        this.collection = {
            user: options.collection.user
        };
        //Connect to db
        if (options.db != null) {
            //already active db is given
            this.db = options.db;
            this.initComponents();
            if (callback) {
                callback(null, options.db);
            }
        }
        else {
            //newly connect
            require('./db').connect(options.url, function (err, db) {
                if (err) {
                    callback(err, null);
                    return;
                }
                _this.db = db;
                _this.initComponents();
                callback(null, db);
            });
        }
    };
    Manager.prototype.initComponents = function () {
        //db
        this.user = new user.Manager(this.userconfig, this.db, this.collection.user, this.options.user);
    };
    //high level user manipulation
    Manager.prototype.entry = function (data, callback) {
        this.user.createNewUser(data, function (err, u) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, {
                user: u
            });
        });
    };
    return Manager;
})();
exports.Manager = Manager;
