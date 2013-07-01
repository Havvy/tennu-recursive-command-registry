Recursive parser for Tennu.

This module is not yet working. Do not use until it is 1.0 or later.

This module replaces the CommandParser in Tennu, subsuming its features, but
also allowing for subcommands inside curly brackets.

## Example

```
<user>!command arg-1 {subcommand arg-2 arg-3}
```

This command registry (and parser) will notice that the user is asking for the
command `command` be executed with the arguments `arg-1` and a subcommand
`subcommand`. It'll execute the subcommand with its arguments `arg-2` and
`arg-3`, and replace it's position with the return value of the subcommand
function. If it is null or undefined, it'll replace with "null" and
"undefined" respectively. Strings will be split at spaces, and replaced with
that. Arrays will replace with themselves. When all subcommands on a level of
a command is executed, the entire list structure is flattened, and those
arguments are passed to command.

## Changes in Command Handlers

The command object has a new property, `isSubcommand` which is false for the
main command and true for subcommands.

You should return a value, and avoid side effects when isSubcommand is true.

You should not return a value, and rely on side effects (like tennu.say())
when isSubcommand is false, as per the default CommandParser in Tennu.