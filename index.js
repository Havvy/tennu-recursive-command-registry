var util = require('util');
var parse = require('./parse');
var debug = function (msg) {
    if (true) {
        console.log(Date.now() + "|CR|" + msg);
    }
};

var startsWith = function (str, substr) {
    for (var ix = 0; ix < substr.length; ix++) {
        if (substr[ix] !== str[ix]) return false;
    }

    return true;
};

var flatten = function (lists) {
    return Array.prototype.concat.apply([], lists);
};

var CommandDoesNotExist = function (command) {
    var err = Object.create(Error);
    err.msg = "Command " + command + " does not exist.";
    return err;
};

module.exports = function CommandRegistry (name, config) {
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
            if (typeof arg === "string") {
                return arg;
            }

            var subcommand = Object.create(command);
            subcommand.name = arg.shift();
            subcommand.args = arg;
            subcommand.isSubcommand = true;
            debug("Interpreting subcommand " + subcommand.name);
            var ret = interp(subcommand);
            debug("Subcommand " + subcommand.name + " result: " + ret);
            return ret;
        });

        if (!(command.name in registry) || command.name === "__proto__") {
            throw CommandDoesNotExist(command.name);
        }

        var ret = registry[command.name](command);

        if (ret === null) {
            return "null";
        } else if (ret === undefined) {
            return "undefined";
        } else if (util.isArray(ret)) {
            return ret;
        } else {
            return ret.toString().split(" ");
        }
    }

    return {
        parseMessage : function parse (msg) {
            var maybeCommandString = toMainCommand(msg);
            if (maybeCommandString === null) {
                return; // Not a command.
            }

            debug("Message received:" + msg);

            var args = maybeCommandString.split(' ');

            var command = {
                sender: msg.actor,
                args: args,
                channel: msg.channel,
                name: args.shift().toLowerCase(),
                isQuery: msg.isQuery || false,
                isSubcommand: false
            };

            try {
                debug("Interpreting main command" + command.name);
                interp(command);
            } catch (err) {
                if (err instanceof CommandDoesNotExist) {
                    debug("Command " + command.name + " does not exist.");
                } else {
                    throw err;
                }
            }
        },

        on : function (cmd, callback) {
            if (cmd in registry) {
                throw new Error("Command " + cmd + " already registered.");
            }

            debug("Adding command: " + cmd);
            registry[cmd] = callback;
        },

        once : function (cmd, callback) {
            var that = this;

            if (cmd in registry) {
                throw new Error("Command " + cmd + " already registered.");
            }

            debug("Adding command (once!): " + cmd);

            registry[cmd] = function () { callback(); that.removeCommand(cmd); };
        },

        removeCommand : function (cmd) {
            debug("Removing command: " + cmd);
            delete registry[cmd];
        }
    };
};

module.exports.CommandDoesNotExist = CommandDoesNotExist;