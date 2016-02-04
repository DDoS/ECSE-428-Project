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
        // Create the user, moderator, admin and question tables if needed
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
                    ');',
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
                        if (error) {
                            console.error(error);
                            throw new Error('Could not create question');
                        }
                        var question = new Question(result.rows[0].id, title, text, result.rows[0].date, submitter, 0, 0);
                        // Also create the argument table for that question
                        client.query(
                            'CREATE TABLE IF NOT EXISTS ' + question.argTableName + ' (' +
                                'id SERIAL PRIMARY KEY,' +
                                'type BOOLEAN NOT NULL,' +
                                'text VARCHAR(4096) NOT NULL,' +
                                'date TIMESTAMP DEFAULT now(),' +
                                'submitter VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                                'downVoteCount INTEGER DEFAULT 0 CHECK (downVoteCount >= 0),' +
                                'upVoteCount INTEGER DEFAULT 0 CHECK (upVoteCount >= 0)' +
                            ');',
                            function(error, result) {
                                done();
                                if (error) {
                                    console.error(error);
                                    throw new Error('Could not create argument table');
                                }
                                createDone(question);
                            }
                        );
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
                var argTableName = 'argTable_' + questionID;
                client.query(
                    'INSERT INTO ' + argTableName + ' (type, text, submitter) VALUES ($1, $2, $3)' +
                        'RETURNING id, date;',
                    [type, text, submitter],
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
                var argTableName = 'argTable_' + questionID;
                client.query(
                    'SELECT type, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + argTableName + ' WHERE id = $1;',
                    [id],
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
                var argTableName = 'argTable_' + questionID;
                // If the type is specified, add it to the where condition
                var whereClause = ' WHERE date >= $1 ';
                var queryArgs = [since, limit, offset];
                if (type === ArgumentType.CON || type === ArgumentType.PRO) {
                    whereClause += 'AND type = $4 ';
                    queryArgs.push(type);
                }
                client.query(
                    'SELECT id, type, text, date, submitter, downVoteCount, upVoteCount ' +
                        'FROM ' + argTableName + whereClause +
                        'ORDER BY date DESC ' +
                        'LIMIT $2 OFFSET $3;',
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

var ArgumentType = Object.freeze({
        "CON": false,
        "PRO": true
});

var Argument = function(id, type, text, date, submitter, downVoteCount, upVoteCount) {
    var self = this;
    self.id = id;
    self.type = type;
    self.text = text;
    self.date = date;
    self.submitter = submitter;
    self.downVoteCount = downVoteCount;
    self.upVoteCount = upVoteCount;
}

function stringEmpty(string) {
    return !string || string.trim().length === 0;
}

module.exports.Database = Database;
module.exports.User = User;
module.exports.Question = Question;
module.exports.ArgumentType = ArgumentType;
module.exports.Argument = Argument;
