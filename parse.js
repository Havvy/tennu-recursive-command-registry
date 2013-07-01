module.exports = function stringToListOfLists (str) {
    var list = [];
    var stack = [list];
    var words = str.split(' ');

    function pop_stack () {
        stack.pop();
        stack[stack.length - 1].push(list);
        list = stack[stack.length - 1];
    }

    function push_stack () {
        list = [];
        stack.push(list);
    }

    function push_word (word) {
        word = word.replace(/\}/g, ""); // See comment below
        if (word.length !== 0) {
            list.push(word);
        }
    }

    words.forEach(function (word) {
        while (word[0] === '{') {
            word = word.substr(1); // cut off the '{'
            push_stack();
        }

        // Because we don't cut off the `}`s, we have to do so in push_word.
        // But the other option is to special case the first `}`, stripping
        // extra `}` there and then pushing and then doing a while loop with
        // the rest of the `}`s. Which takes a lot of room, like this comment.
        push_word(word);

        while (word[word.length -1] === '}') {
            word = word.substr(0, word.length - 1); // cut off the '}'
            pop_stack();
        }
    });

    return list;
};