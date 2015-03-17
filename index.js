var main = require('./lib/main');
exports.User = main.User;
exports.UserConfig = main.UserConfig;
function manager(options) {
    return new main.Manager(options);
}
exports.manager = manager;
