var util = require('util');
var parse = require('./parse');

var startsWith = function (str, substr) {
    return substr.every(function (c, ix) { return str[ix] === c; });
};

var flatten = function (lists) {
    return Array.prototype.concat.apply([], lists);
};

var CommandDoesNotExist = function (command) {
    var err = Object.create(Error);
    err.msg = "Command " + command + " does not exist.";
    return err;
};

moduleExports = function CommandRegistry (name, config) {
    var trigger = config.trigger || "!";
    var registry = Object.create(null);

    function toMainCommand (privmsg) {
        if (startsWith(privmsg.message, trigger)) {
            return privmsg.message.substr(trigger.length);
        }

        if (privmsg.isQuery) {
            return privmsg.message;
        }

        if (privmsg.message.indexOf(name()) === 0) {
            var msg = privmsg.message.substr(privmsg.message.indexOf(" ") + 1);
            return (startsWith(msg, trigger) ? msg.substr(trigger.length) : msg);
        }

        return null;
    }

    function interp (command) {
        command.args = command.args.map(function (arg) {
            if (typeof arg !== "string") {
                var subcommand = Object.create(command);
                subcommand.name = arg.shift();
                subcommand.args = arg;
                return interp(subcommand);
            } else {
                return arg;
            }
        });

        if (!(command.name in registry) || command.name === "__proto__") {
            throw CommandDoesNotExist(command.name);
        }

        var ret = registry[command.name](command);
        return util.isArray(ret) ? ret : ret.toString().split(" ");
    }

    return {
        parseMessage : function parse (msg, recursive) {
            var maybeCommandString = toMainCommand(privmsg);
            if (maybeCommandString === null) {
                return; // Not a command.
            }

            var args = maybeCommandString.split(' ');

            var command = {
                sender: msg.actor,
                args: args,
                channel: msg.channel,
                name: args.shift().toLowerCase(),
                isQuery: msg.isQuery || false,
                isMain: true
            };

            try {
                interp(command);
            } catch (err) {
                if (!(err instanceof CommandDoesNotExist)) {
                    throw err;
                }
            }
        },

        on : function (cmd, callback) {
            if (cmd in registry) {
                throw new Error("Command " + cmd + " already registered.");
            }

            registry[cmd] = callback;
        },

        once : function (cmd, callback) {
            var that = this;

            if (cmd in registry) {
                throw new Error("Command " + cmd + " already registered.");
            }

            registry[cmd] = function () { callback(); that.removeCommand(cmd); };
        },

        removeCommand : function (cmd) {
            delete registry[cmd];
        }
    };
};

module.exports.CommandDoesNotExist = CommandDoesNotExist;