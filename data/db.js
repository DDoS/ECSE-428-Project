var pg = require('pg');
var crypto = require('crypto');

const SMALLEST_DATE = new Date('1900-01-01');

const host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.PGHOST;
const port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.PGPORT;
const user = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.PGUSER;
const password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.PGPASSWORD;

const userTable = 'Users';
const moderatorTable = 'Moderators';
const adminTable = 'Admins';
const questionTable = 'Questions';
const argumentTable = 'Arguments';
const questionVoteTable = 'QuestionVotes';
const argumentVoteTable = 'ArgumentVotes';

var Database = function(dbName){
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
                    'CREATE TABLE IF NOT EXISTS ' + userTable + '(' +
                        'username VARCHAR(64) NOT NULL PRIMARY KEY,' +
                        'salt CHAR(64) NOT NULL,' +
                        'password CHAR(64) NOT NULL,' +
                        'email VARCHAR(128) NOT NULL' +
                    ');' +
                    'CREATE TABLE IF NOT EXISTS ' + moderatorTable + ' (' +
                        'username VARCHAR(64) NOT NULL PRIMARY KEY REFERENCES ' + userTable +
                    ');' +
                    'CREATE TABLE IF NOT EXISTS ' + adminTable + ' (' +
                        'username VARCHAR(64) NOT NULL PRIMARY KEY REFERENCES ' + userTable +
                    ');' +
                    'CREATE TABLE IF NOT EXISTS ' + questionTable + ' (' +
                        'id BIGSERIAL PRIMARY KEY,' +
                        'title VARCHAR(256) NOT NULL,' +
                        'text VARCHAR(4096) NOT NULL,' +
                        'date TIMESTAMP DEFAULT now(),' +
                        'submitter VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                        'downVoteCount INTEGER DEFAULT 0 CHECK (downVoteCount >= 0),' +
                        'upVoteCount INTEGER DEFAULT 0 CHECK (upVoteCount >= 0)' +
                    ');' +
                    'CREATE TABLE IF NOT EXISTS ' + argumentTable + ' (' +
                        'id BIGSERIAL,' +
                        'questionID BIGINT NOT NULL REFERENCES ' + questionTable + ',' +
                        'type BOOLEAN NOT NULL,' +
                        'text VARCHAR(4096) NOT NULL,' +
                        'date TIMESTAMP DEFAULT now(),' +
                        'submitter VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                        'downVoteCount INTEGER DEFAULT 0 CHECK (downVoteCount >= 0),' +
                        'upVoteCount INTEGER DEFAULT 0 CHECK (upVoteCount >= 0),' +
                        'PRIMARY KEY (id, questionID)' +
                    ');' +
                    'CREATE TABLE IF NOT EXISTS ' + questionVoteTable + ' (' +
                        'questionID BIGINT NOT NULL REFERENCES ' + questionTable + ',' +
                        'username VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                        'vote BOOLEAN NOT NULL,' +
                        'PRIMARY KEY (questionID, username)' +
                    ');' +
                    'CREATE OR REPLACE FUNCTION ' +
                        'upsertQuestionVote(qid BIGINT, usr VARCHAR(64), v BOOLEAN) ' +
                        'RETURNS VOID AS $$ ' +
                    'BEGIN ' +
                        'LOOP ' +
                            'UPDATE ' + questionVoteTable + ' SET vote = v ' +
                                'WHERE questionID = qid AND username = usr; ' +
                            'IF found THEN ' +
                                'RETURN; ' +
                            'END IF; ' +
                            'BEGIN ' +
                                'INSERT INTO ' + questionVoteTable + ' (questionID, username, vote) ' +
                                    'VALUES (qid, usr, v); ' +
                                'RETURN; ' +
                            'EXCEPTION WHEN unique_violation THEN ' +
                            'END; ' +
                        'END LOOP; ' +
                    'END; ' +
                    '$$ LANGUAGE plpgsql;' +
                    'CREATE TABLE IF NOT EXISTS ' + argumentVoteTable + ' (' +
                        'questionID BIGINT NOT NULL,' +
                        'argumentID BIGINT NOT NULL,' +
                        'username VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                        'vote BOOLEAN NOT NULL,' +
                        'FOREIGN KEY (questionID, argumentID) REFERENCES ' + argumentTable + ' (questionID, id),' +
                        'PRIMARY KEY (questionID, argumentID, username)' +
                    ');' +
                    'CREATE OR REPLACE FUNCTION ' +
                        'upsertArgumentVote(qid BIGINT, aid BIGINT, usr VARCHAR(64), v BOOLEAN) ' +
                        'RETURNS VOID AS $$ ' +
                    'BEGIN ' +
                        'LOOP ' +
                            'UPDATE ' + argumentVoteTable + ' SET vote = v ' +
                                'WHERE questionID = qid AND argumentID = aid AND username = usr; ' +
                            'IF found THEN ' +
                                'RETURN; ' +
                            'END IF; ' +
                            'BEGIN ' +
                                'INSERT INTO ' + argumentVoteTable + ' (questionID, argumentID, username, vote) ' +
                                    'VALUES (qid, aid, usr, v); ' +
                                'RETURN; ' +
                            'EXCEPTION WHEN unique_violation THEN ' +
                            'END; ' +
                        'END LOOP; ' +
                    'END; ' +
                    '$$ LANGUAGE plpgsql;',
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
    };

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
                    'INSERT INTO ' + userTable + ' VALUES ($1, $2, $3, $4);',
                    [username, salt, password, email],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create user');
                        }
                        var user = new User(username, salt, password, email);
                        createDone(user);
                    }
                );
            }
        );
    };

    self.getUser = function(username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT salt, password, email FROM ' + userTable + ' WHERE username = $1;',
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
                            user = new User(username, result.rows[0].salt, result.rows[0].password, result.rows[0].email);
                        }
                        getDone(user);
                    }
                );
            }
        );
    };

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
                    'INSERT INTO ' + questionTable + ' (title, text, submitter) VALUES ($1, $2, $3)' +
                        'RETURNING id, date;',
                    [title, text, submitter],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create question');
                        }
                        var question = new Question(result.rows[0].id, title, text, result.rows[0].date, submitter, 0, 0);
                        createDone(question);
                    }
                );
            }
        );
    };

    self.getQuestion = function(id, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT title, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + questionTable + ' WHERE id = $1;',
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
                            question = new Question(
                                id, result.rows[0].title, result.rows[0].text, result.rows[0].date,
                                // column names aren't case sentitive, so vote counts are all lower case
                                result.rows[0].submitter, result.rows[0].downvotecount, result.rows[0].upvotecount
                            );
                        }
                        getDone(question);
                    }
                );
            }
        );
    };

    self.getNewQuestions = function(since, limit, offset, getDone) {
        if (since === undefined) {
            since = SMALLEST_DATE;
        } else if (since > new Date()) {
            throw Error("Since date is in the future");
        }
        if (limit === undefined) {
            limit = 10;
        }
        if (offset === undefined) {
            offset = 0;
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT id, title, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + questionTable + ' WHERE date >= $1 ' +
                        'ORDER BY date DESC ' +
                        'LIMIT $2 OFFSET $3;',
                    [since, limit, offset],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get questions');
                        }
                        var questions = [];
                        result.rows.forEach(function(row, index, array) {
                            questions.push(new Question(
                                row.id, row.title, row.text, row.date,
                                row.submitter, row.downvotecount, row.upvotecount
                            ));
                        });
                        getDone(questions);
                    }
                );
            }
        );
    };

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
                    'INSERT INTO ' + argumentTable + ' (questionID, type, text, submitter) VALUES ($1, $2, $3, $4)' +
                        'RETURNING id, date;',
                    [questionID, type, text, submitter],
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create argument');
                        }
                        var argument = new Argument(result.rows[0].id, type, text, result.rows[0].date, submitter, 0, 0);
                        createDone(argument);
                    }
                );
            }
        );
    };

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
                    'SELECT type, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + argumentTable + ' WHERE questionID = $1 AND id = $2;',
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
                            argument = new Argument(
                                id, result.rows[0].type, result.rows[0].text, result.rows[0].date,
                                result.rows[0].submitter, result.rows[0].downvotecount, result.rows[0].upvotecount
                            );
                        }
                        getDone(argument);
                    }
                );
            }
        );
    };

    self.getNewArguments = function(questionID, type, since, limit, offset, getDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        if (since === undefined) {
            since = SMALLEST_DATE;
        } else if (since > new Date()) {
            throw Error("Since date is in the future");
        }
        if (limit === undefined) {
            limit = 10;
        }
        if (offset === undefined) {
            offset = 0;
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                // If the type is specified, add it to the where condition
                var whereClause = ' WHERE questionID = $1 AND date >= $2 ';
                var queryArgs = [questionID, since, limit, offset];
                if (type === ArgumentType.CON || type === ArgumentType.PRO) {
                    whereClause += 'AND type = $5 ';
                    queryArgs.push(type);
                }
                client.query(
                    'SELECT id, type, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + argumentTable + whereClause +
                        'ORDER BY date DESC ' +
                        'LIMIT $3 OFFSET $4;',
                    queryArgs,
                    function(error, result) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get arguments');
                        }
                        var args = [];
                        result.rows.forEach(function(row, index, array) {
                            args.push(new Argument(
                                row.id, row.type, row.text, row.date,
                                row.submitter, row.downvotecount, row.upvotecount
                            ));
                        });
                        getDone(args);
                    }
                );
            }
        );
    };

    self.getQuestionVote = function(questionID, username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT vote FROM ' + questionVoteTable + ' WHERE questionID = $1 AND username = $2;',
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
                            if (result.rows[0].vote) {
                                vote = VoteType.UP;
                            } else {
                                vote = VoteType.DOWN;
                            }
                        }
                        getDone(vote);
                    }
                );
            }
        );
    };

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
                    upVote = vote === VoteType.UP;
                    client.query(
                        'SELECT upsertQuestionVote($1, $2, $3)',
                        [questionID, username, upVote],
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
                        'DELETE FROM ' + questionVoteTable + ' WHERE questionID = $1 AND username = $2',
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
    };

    self.getArgumentVote = function(questionID, argumentID, username, getDone) {
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'SELECT vote FROM ' + argumentVoteTable + ' WHERE questionID = $1 AND argumentID = $2 AND username = $3;',
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
                            if (result.rows[0].vote) {
                                vote = VoteType.UP;
                            } else {
                                vote = VoteType.DOWN;
                            }
                        }
                        getDone(vote);
                    }
                );
            }
        );
    };

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
                    upVote = vote === VoteType.UP;
                    client.query(
                        'SELECT upsertArgumentVote($1, $2, $3, $4)',
                        [questionID, argumentID, username, upVote],
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
                        'DELETE FROM ' + argumentVoteTable + ' WHERE questionID = $1 AND argumentID = $2 AND username = $3',
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
    };

    // For testing only
    self.rawQuery = function(query) {
        pg.connect(config, query);
    };
};

var User = function(username, salt, password, email) {
    var self = this;
    self.username = username;
    self.email = email;

    self.authenticate = function(passwordText) {
        var hash = crypto.createHash('sha256');
        var attemptPassword = hash.update(passwordText).update(salt).digest('hex');
        return attemptPassword === password;
    };

};

var Question = function(id, title, text, date, submitter, downVoteCount, upVoteCount) {
    var self = this;
    self.id = id;
    self.title = title;
    self.text = text;
    self.date = date;
    self.submitter = submitter;
    self.downVoteCount = downVoteCount;
    self.upVoteCount = upVoteCount;
    self.argTableName = 'argTable_' + id;
};

var Argument = function(id, type, text, date, submitter, downVoteCount, upVoteCount) {
    var self = this;
    self.id = id;
    self.type = type;
    self.text = text;
    self.date = date;
    self.submitter = submitter;
    self.downVoteCount = downVoteCount;
    self.upVoteCount = upVoteCount;
};

var ArgumentType = Object.freeze({
        "CON": false,
        "PRO": true
});

var VoteType = Object.freeze({
    "UP": 1,
    "DOWN": 2,
    "NONE": 3
});

function stringEmpty(string) {
    return !string || string.trim().length === 0;
}

module.exports.Database = Database;
module.exports.User = User;
module.exports.Question = Question;
module.exports.ArgumentType = ArgumentType;
module.exports.Argument = Argument;
module.exports.VoteType = VoteType;
