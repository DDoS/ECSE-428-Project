var pg = require('pg');

const host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.PGHOST;
const port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.PGPORT;
const user = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.PGUSER;
const password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.PGPASSWORD;
const db = 'mayhem';
const url = 'postgres://' + user + (password === "undefined" ? '' : ':' + password) + '@' + host + ':' + port + '/' + db;

const userTable = 'Users';
const moderatorTable = 'Moderators';
const adminTable = 'Admins'
const questionTable = 'Questions';

var Database = function() {
    var self = this;

    self.initialize = function() {
        // Create the user, moderator, admin and question tables if needed
        pg.connect(url,
            function(error, client, done) {
                if (error) {
                  return console.error('Error creating query', error);
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
                        'conTableName VARCHAR(32) NOT NULL,' +
                        'proTableName VARCHAR(32) NOT NULL' +
                    ');',
                    function(error, result) {
                        done();
                        if (error) {
                            console.error('Could not create default tables', error);
                        } else {
                            console.log('Default tables are ready');
                        }
                    }
                );
            }
        );
    }
}

module.exports.Database = Database;
