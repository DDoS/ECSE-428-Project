var pg = require('pg');
var fs = require('fs');
var crypto = require('crypto');

const SMALLEST_DATE = new Date('1900-01-01');

const host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.PGHOST;
const port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.PGPORT;
const user = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.PGUSER;
const password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.PGPASSWORD;

var createQuery = fs.readFileSync('data/create.psql').toString()
var genClear = fs.readFileSync('data/gen_clear.psql').toString()

var Database = function(dbName) {
    var self = this;

    var config = {
        host: host,
        port: port,
        user: user,
        password: password,
        database: dbName
    };

    self.initialize = function(initDone) {
        // Create tables and functions
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    createQuery,
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create default tables');
                        }
                        initDone();
                    }
                );
            }
        );
    }

    self.clear = function(clearDone) {
        pg.connect(config, function(error, client, done) {
            if (error) {
                console.error(error);
                throw new Error('Error creating query');
            }
            client.query(
                genClear,
                function(error, result) {
                    if (error) {
                        console.error(error);
                        throw new Error('Could not drop test tables and functions');
                    }
                    var dropTablesQueries = "";
                    result.rows.forEach(function(row, index, array) {
                        dropTablesQueries += row['?column?'];
                    });
                    client.query(
                        dropTablesQueries,
                        function(error, result) {
                            done();
                            if (error) {
                                console.error(error);
                                throw new Error('Could not drop test tables and functions');
                            }
                            clearDone();
                        }
                    );
                }
            );
        });
    }

    self.createUser = function(username, passwordText, email, createDone) {
        if (stringEmpty(username)) {
            throw new Error('username is empty');
        }
        if (stringEmpty(passwordText)) {
            throw new Error('password is empty');
        }
        if (stringEmpty(email)) {
            throw new Error('email is empty');
        }
        // Generate a unique salt for each user
        var salt = crypto.randomBytes(32).toString('hex');
        // Hash the combined password and salt
        var hash = crypto.createHash('sha256');
        var password = hash.update(passwordText).update(salt).digest('hex');
        // Store the username, email, hashed password and salt
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'INSERT INTO users VALUES ($1, $2, $3, $4);',
                    [username, salt, password, email],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create user');
                        }
                        var user = new User(username, salt, password, email, false);
                        createDone(user);
                    }
                );
            }
        );
    }

    self.getUser = function(username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT salt, password, email, deleted FROM users WHERE username = $1;',
                    [username],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get user');
                        }
                        var user;
                        if (result.rows.length <= 0) {
                            user = undefined;
                        } else {
                            user = new User(username, result.rows[0].salt, result.rows[0].password,
                                result.rows[0].email, result.rows[0].deleted);
                        }
                        getDone(user);
                    }
                );
            }
        );
    }

    self.editUserEmail = function(username, newEmail, editDone) {
        if (stringEmpty(newEmail)) {
            throw new Error('new email is empty');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'UPDATE users SET email = $2 WHERE username = $1;',
                    [username, newEmail],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could update user email');
                        }
                        editDone();
                    }
                );
            }
        );
    }

    self.editUserPassword = function(username, newPasswordText, editDone) {
        if (stringEmpty(newPasswordText)) {
            throw new Error('new password is empty');
        }
        // Generate a new salt and hash the new password
        var salt = crypto.randomBytes(32).toString('hex');
        var hash = crypto.createHash('sha256');
        var password = hash.update(newPasswordText).update(salt).digest('hex');
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'UPDATE users SET salt = $2, password = $3 WHERE username = $1;',
                    [username, salt, password],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could update user password');
                        }
                        editDone();
                    }
                );
            }
        );
    }

    self.deleteUser = function(username, deleteDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'UPDATE users SET deleted = TRUE WHERE username = $1;',
                    [username],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not delete user');
                        }
                        deleteDone();
                    }
                );
            }
        );
    }

    self.createQuestion = function(title, text, submitter, createDone) {
        if (stringEmpty(title)) {
            throw new Error('title is empty');
        }
        if (stringEmpty(text)) {
            throw new Error('text is empty');
        }
        if (stringEmpty(submitter)) {
            throw new Error('submitter is empty');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'INSERT INTO questions (title, text, submitter) VALUES ($1, $2, $3)' +
                        'RETURNING id, date;',
                    [title, text, submitter],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create question');
                        }
                        var question = new Question(
                            result.rows[0].id, title, text, result.rows[0].date,
                            null, submitter, 0, 0, false
                        );
                        createDone(question);
                    }
                );
            }
        );
    }

    self.getQuestion = function(id, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT title, text, date, last_edit_date, submitter, submitter_deleted ' +
                        'FROM user_questions WHERE id = $1;',
                    [id],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get question');
                        }
                        var question;
                        if (result.rows.length <= 0) {
                            question = undefined;
                        } else {
                            var row = result.rows[0];
                            question = new Question(
                                id, row.title, row.text, row.date, row.last_edit_date,
                                row.submitter, row.submitter_deleted
                            );
                        }
                        getDone(question);
                    }
                );
            }
        );
    }

    self.findQuestions = function(options, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                var query = options.genQuery(undefined);
                client.query(
                    query[0],
                    query[1],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get questions');
                        }
                        var questions = [];
                        result.rows.forEach(function(row, index, array) {
                            questions.push(new Question(
                                row.id, row.title, row.text, row.date, row.last_edit_date,
                                row.submitter, row.submitter_deleted
                            ));
                        });
                        getDone(questions);
                    }
                );
            }
        );
    }

    self.editQuestion = function(id, newText, editDone) {
        if (stringEmpty(newText)) {
            throw new Error('new text is empty');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'UPDATE questions ' +
                        'SET text = $2, last_edit_date = now() ' +
                        'WHERE id = $1;',
                    [id, newText],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not update question');
                        }
                        editDone();
                    }
                );
            }
        );
    }

    self.deleteQuestion = function(id, deleteDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'DELETE FROM questions WHERE id = $1;',
                    [id],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not delete question');
                        }
                        deleteDone();
                    }
                );
            }
        );
    }

    self.createArgument = function(questionID, type, text, submitter, createDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        if (type !== ArgumentType.CON && type !== ArgumentType.PRO) {
            throw new Error('argument type is neither pro or con');
        }
        if (stringEmpty(text)) {
            throw new Error('text is empty');
        }
        if (stringEmpty(submitter)) {
            throw new Error('submitter is empty');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'INSERT INTO arguments (question_id, type, text, submitter) VALUES ($1, $2, $3, $4)' +
                        'RETURNING id, date;',
                    [questionID, type, text, submitter],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create argument');
                        }
                        var argument = new Argument(
                            result.rows[0].id, type, text, result.rows[0].date,
                            null, submitter, 0, 0, false
                        );
                        createDone(argument);
                    }
                );
            }
        );
    }

    self.getArgument = function(questionID, id, getDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT type, text, date, last_edit_date, submitter, submitter_deleted ' +
                        'FROM user_arguments WHERE question_id = $1 AND id = $2;',
                    [questionID, id],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get argument');
                        }
                        var argument;
                        if (result.rows.length <= 0) {
                            argument = undefined;
                        } else {
                            var row = result.rows[0];
                            argument = new Argument(
                                id, row.type, row.text, row.date, row.last_edit_date,
                                row.submitter, row.submitter_deleted
                            );
                        }
                        getDone(argument);
                    }
                );
            }
        );
    }

    self.findArguments = function (questionID, options, getDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                var query = options.genQuery(questionID);
                client.query(
                    query[0],
                    query[1],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get arguments');
                        }
                        var args = [];
                        result.rows.forEach(function(row, index, array) {
                            args.push(new Argument(
                                row.id, row.type, row.text, row.date, row.last_edit_date,
                                row.submitter, row.submitter_deleted
                            ));
                        });
                        getDone(args);
                    }
                );
            }
        );
    }

    self.editArgument = function(questionID, id, newText, editDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        if (stringEmpty(newText)) {
            throw new Error('new text is empty');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'UPDATE arguments ' +
                        'SET text = $3, last_edit_date = now() ' +
                        'WHERE question_id = $1 AND id = $2;',
                    [questionID, id, newText],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not update argument');
                        }
                        editDone();
                    }
                );
            }
        );
    }

    self.deleteArgument = function(questionID, id, deleteDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'DELETE FROM arguments WHERE question_id = $1 AND id = $2;',
                    [questionID, id],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not delete argument');
                        }
                        deleteDone();
                    }
                );
            }
        );
    }

    self.getQuestionVote = function(questionID, username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT vote FROM question_votes WHERE question_id = $1 AND username = $2;',
                    [questionID, username],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get question vote');
                        }
                        var vote;
                        if (result.rows.length <= 0) {
                            vote = VoteType.NONE;
                        } else {
                            vote = result.rows[0].vote;
                        }
                        getDone(vote);
                    }
                );
            }
        );
    }

    self.setQuestionVote = function(questionID, username, vote, setDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        if (stringEmpty(username)) {
            throw new Error('username is empty');
        }
        if (vote === VoteType.UP || vote === VoteType.DOWN) {
            pg.connect(
                config,
                function(error, client, done) {
                    if (error) {
                        console.error(error);
                        throw new Error('Error creating query');
                    }
                    client.query(
                        'SELECT upsert_question_vote($1, $2, $3)',
                        [questionID, username, vote],
                        function(error, result) {
                            done();
                            if (error) {
                                console.error(error);
                                throw new Error('Could set question vote');
                            }
                            setDone();
                        }
                    );
                }
            );
        } else if (vote === VoteType.NONE) {
            pg.connect(
                config,
                function(error, client, done) {
                    if (error) {
                        console.error(error);
                        throw new Error('Error creating query');
                    }
                    client.query(
                        'DELETE FROM question_votes WHERE question_id = $1 AND username = $2',
                        [questionID, username],
                        function(error, result) {
                            done();
                            if (error) {
                                console.error(error);
                                throw new Error('Could remove question vote');
                            }
                            setDone();
                        }
                    );
                }
            );
        } else {
            throw new Error('vote type is neither up, down or none');
        }
    }

    self.getArgumentVote = function(questionID, argumentID, username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT vote FROM argument_votes WHERE question_id = $1 AND argument_id = $2 AND username = $3;',
                    [questionID, argumentID, username],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get argument vote');
                        }
                        var vote;
                        if (result.rows.length <= 0) {
                            vote = VoteType.NONE;
                        } else {
                            vote = result.rows[0].vote;
                        }
                        getDone(vote);
                    }
                );
            }
        );
    }

    self.setArgumentVote = function(questionID, argumentID, username, vote, setDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        if (argumentID === undefined) {
            throw new Error('argument ID is undefined');
        }
        if (stringEmpty(username)) {
            throw new Error('username is empty');
        }
        if (vote === VoteType.UP || vote === VoteType.DOWN) {
            pg.connect(
                config,
                function(error, client, done) {
                    if (error) {
                        console.error(error);
                        throw new Error('Error creating query');
                    }
                    client.query(
                        'SELECT upsert_argument_vote($1, $2, $3, $4)',
                        [questionID, argumentID, username, vote],
                        function(error, result) {
                            done();
                            if (error) {
                                console.error(error);
                                throw new Error('Could set argument vote');
                            }
                            setDone();
                        }
                    );
                }
            );
        } else if (vote === VoteType.NONE) {
            pg.connect(
                config,
                function(error, client, done) {
                    if (error) {
                        console.error(error);
                        throw new Error('Error creating query');
                    }
                    client.query(
                        'DELETE FROM argument_votes WHERE question_id = $1 AND argument_id = $2 AND username = $3',
                        [questionID, argumentID, username],
                        function(error, result) {
                            done();
                            if (error) {
                                console.error(error);
                                throw new Error('Could remove argument vote');
                            }
                            setDone();
                        }
                    );
                }
            );
        } else {
            throw new Error('vote type is neither up, down or none');
        }
    }

    self.getQuestionVoteScore = function(questionID, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT sum(vote) AS score FROM question_votes WHERE question_id = $1;',
                    [questionID],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get question vote score');
                        }
                        var score = result.rows[0].score;
                        getDone(score === null ? 0 : score);
                    }
                );
            }
        );
    }

    self.getArgumentVoteScore = function(questionID, argumentID, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT sum(vote) AS score FROM argument_votes WHERE question_id = $1 AND argument_id = $2;',
                    [questionID, argumentID],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get argument vote score');
                        }
                        var score = result.rows[0].score;
                        getDone(score === null ? 0 : score);
                    }
                );
            }
        );
    }
};

var User = function(username, salt, password, email, deleted) {
    var self = this;
    self.username = username;
    self.email = email;
    self.deleted = deleted

    self.authenticate = function(passwordText) {
        if (self.deleted) {
            return false
        }
        var hash = crypto.createHash('sha256');
        var attemptPassword = hash.update(passwordText).update(salt).digest('hex');
        return attemptPassword === password;
    };

};

var Question = function(id, title, text, date, lastEditDate, submitter, submitterDeleted) {
    var self = this;
    self.id = id;
    self.title = title;
    self.text = text;
    self.date = date;
    self.lastEditDate = lastEditDate;
    self.wasEdited = lastEditDate !== null;
    self.submitter = submitterDeleted ? '[deleted]' : submitter;
    self.submitterDeleted = submitterDeleted;
};

var Argument = function(id, type, text, date, lastEditDate, submitter, submitterDeleted) {
    var self = this;
    self.id = id;
    self.type = type;
    self.text = text;
    self.date = date;
    self.lastEditDate = lastEditDate;
    self.wasEdited = lastEditDate !== null;
    self.submitter = submitterDeleted ? '[deleted]' : submitter;
    self.submitterDeleted = submitterDeleted;
};

var ArgumentType = Object.freeze({
        "CON": false,
        "PRO": true
});

var VoteType = Object.freeze({
    "UP": 1,
    "DOWN": -1,
    "NONE": 0
});

var SearchOptions = function() {
    var self = this;
    self.offset = 0;
    self.limit = 10;
    self.type = undefined;
    self.since = undefined;
    self.keywords = undefined;
    self.orderType = 0;
    self.ascending = false;

    self.withOffset = function(offset) {
        if (offset === undefined) {
            throw new Error('Undefined offset');
        }
        self.offset = offset;
        return self;
    }

    self.withLimit = function(limit) {
        if (limit === undefined) {
            throw new Error('Undefined limit');
        }
        self.limit = limit;
        return self;
    }

    self.withType = function(type) {
        if (type !== ArgumentType.CON && type !== ArgumentType.PRO) {
            throw new Error('Invalid type');
        }
        self.type = type;
        return self;
    }

    self.withSince = function(since) {
        if (since === undefined) {
            throw new Error('Undefined since');
        }
        self.since = since;
        return self;
    }

    self.withKeywords = function(keywords) {
        if (typeof(keywords) === 'string' && !stringEmpty(keywords)) {
            self.keywords = keywords;
        }
        return self;
    }

    self.orderByDate = function() {
        self.orderType = 0;
        return self;
    }

    self.orderByScore = function() {
        self.orderType = 1;
        return self;
    }

    self.orderAscending = function() {
        self.ascending = true;
        return self;
    }

    self.orderDescending = function() {
        self.ascending = false;
        return self;
    }

    self.genQuery = function(questionID) {
        var argSearch = questionID !== undefined;
        // select clause
        var selectText = 'SELECT ' + (
            argSearch ?
            'id, type, text, date, last_edit_date, submitter, submitter_deleted' :
            'id, title, text, date, last_edit_date, submitter, submitter_deleted'
        );
        // from clause
        var fromText = 'FROM ' + (argSearch ? 'user_arguments' : 'user_questions');
        // where clause
        var conditions = [];
        var queryArgs = [];
        queryArgs.push(self.offset);
        queryArgs.push(self.limit);
        var i = 3;
        if (argSearch) {
            conditions.push('question_id = $' + i++);
            queryArgs.push(questionID);
        }
        if (self.type !== undefined) {
            conditions.push('type = $' + i++);
            queryArgs.push(self.type);
        }
        if (self.since !== undefined) {
            conditions.push('date >= $' + i++);
            queryArgs.push(self.since);
        }
        if (self.keywords !== undefined) {
            var text;
            if (argSearch) {
                text = 'text';
            } else {
                text = 'title || \' \' || text';
            }
            conditions.push('to_tsvector('+ text + ') @@ plainto_tsquery($' + i++ + ')');
            queryArgs.push(self.keywords);
        }
        var whereText = conditions.length !== 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        // order clause
        var orderText;
        if (self.orderType === 0) {
            orderText = 'ORDER BY date';
        } else if (self.orderType === 1) {
            if (argSearch) {
                fromText += ' LEFT OUTER JOIN (' +
                    'SELECT argument_id, sum(vote) AS score ' +
                        'FROM argument_votes ' +
                        'WHERE question_id = $3 ' +
                        'GROUP BY argument_id' +
                ') scores ON user_arguments.id = scores.argument_id'
            } else {
                fromText +=  ' LEFT OUTER JOIN (' +
                    'SELECT question_id, sum(vote) AS score ' +
                        'FROM question_votes ' +
                        'GROUP BY question_id' +
                ') scores ON user_questions.id = scores.question_id'
            }
            orderText = 'ORDER BY CASE WHEN score IS NULL THEN 0 ELSE score END';
        } else {
            throw new Error('Unknown order type');
        }
        if (self.ascending) {
            orderText += ' ASC';
        } else {
            orderText += ' DESC';
        }
        var queryText = selectText + ' ' + fromText + ' ' + whereText + ' ' + orderText + ' ' + 'OFFSET $1 LIMIT $2;'
        return [queryText, queryArgs];
    }
}

function stringEmpty(string) {
    return !string || string.trim().length === 0;
}

module.exports.Database = Database;
module.exports.User = User;
module.exports.Question = Question;
module.exports.ArgumentType = ArgumentType;
module.exports.Argument = Argument;
module.exports.VoteType = VoteType;
module.exports.SearchOptions = SearchOptions;
