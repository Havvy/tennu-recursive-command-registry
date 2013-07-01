var util = require('util');
var inspect = util.inspect;

var parse = require('./parse');
var compare = function cmp (l1, l2) {
    if (typeof l1 === "string") {
        return l1 === l2;
    }

    if (util.isArray(l1)) {
        return l1.every(function (e, i) {
            return cmp(l1[i], l2[i]);
        });
    }

    return false;
};

var tests = [
    ["abc",              ['abc']                   ],
    ["abc def",          ['abc', 'def']            ],
    ["abc {def}",        ['abc', ['def']]          ],
    ["abc { def }",      ['abc', ['def']]          ],
    ["{abc} {def {g}}",  [['abc'], ['def', ['g']]] ]
];

for (var ix = 0; ix < tests.length; ix++) {
    if (!compare(parse(tests[ix][0]), tests[ix][1])) {
        console.log('Failed to parse ' + tests[ix][0] + ' properly.');
        console.log('Got: ' + inspect(tests[ix][1]));
    }
}