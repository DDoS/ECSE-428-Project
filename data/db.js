var pg = require('pg');
var crypto = require('crypto');

const host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.PGHOST;
const port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.PGPORT;
const user = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.PGUSER;
const password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.PGPASSWORD;

const userTable = 'Users';
const moderatorTable = 'Moderators';
const adminTable = 'Admins'
const questionTable = 'Questions';

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
        // Create the user, moderator, admin and question tables if needed
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    throw new Error('Error creating query', error);
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
                        'date TIMESTAMP NOT NULL,' +
                        'submitter VARCHAR(64) NOT NULL REFERENCES ' + userTable + ',' +
                        'downVoteCount INTEGER NOT NULL CHECK (downVoteCount >= 0),' +
                        'upVoteCount INTEGER NOT NULL CHECK (upVoteCount >= 0),' +
                        'conTableName VARCHAR(32),' +
                        'proTableName VARCHAR(32)' +
                    ');',
                    function(error, result) {
                        done();
                        if (error) {
                            throw new Error('Could not create default tables', error);
                        }
                        initDone();
                    }
                );
            }
        );
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
                    throw new Error('Error creating query', error);
                }
                client.query(
                    'INSERT INTO ' + userTable + ' VALUES (' +
                        '$1, $2, $3, $4' +
                    ');',
                    [username, salt, password, email],
                    function(error, result) {
                        done();
                        if (error) {
                            throw new Error('Could not create user', error);
                        }
                        var user = new User(username, salt, password, email);
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
                    throw new Error('Error creating query', error);
                }
                client.query(
                    'SELECT salt, password, email FROM ' + userTable + ' WHERE ' + ' username = $1;',
                    [username],
                    function(error, result) {
                        done();
                        if (error) {
                            throw new Error('Could not create user', error);
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
    }

    // For testing only
    self.rawQuery = function(query) {
        pg.connect(config, query);
    }
}

var User = function(username, salt, password, email) {
    var self = this;
    self.username = username;
    self.email = email;

    self.authenticate = function(passwordText) {
        var hash = crypto.createHash('sha256');
        var attemptPassword = hash.update(passwordText).update(salt).digest('hex');
        return attemptPassword === password;
    }

}

function stringEmpty(string) {
    return !string || string.trim().length === 0;
}

module.exports.Database = Database;
module.exports.User = User;
