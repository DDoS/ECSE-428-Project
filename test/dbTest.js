var db = require('../data/db');
var assert = require('assert');

const dbName = 'mayhemTest';

describe('Database', function() {
    var database = new db.Database(dbName);

    before(function(done) {
        // Create the Users, Moderators, Admins and Questions tables
        database.initialize(done);
    });

	describe('#createUser(username, password, email)', function() {
		it('Should insert a new row in the user table and return a new user object', function(done) {
			database.createUser('Guy', 'shittyPassword12', 'dude@webmail.com', function(user) {
                assert.equal('Guy', user.username);
                assert.equal('dude@webmail.com', user.email);
                assert(user.authenticate('shittyPassword12'));
                // Check is user is indeed in the db
                database.getUser('Guy', function(getUser) {
                    assert.equal('Guy', getUser.username);
                    assert.equal('dude@webmail.com', getUser.email);
                    //assert(getUser.authenticate('shittyPassword12'));
                    done();
                });
            });
		});

        it('Should not allow an empty username', function() {
            assert.throws(
                function() {
                    database.createUser('', 'shittyPassword12', 'dude@webmail.com', function() { return undefined; });
                },
                Error, 'username is empty'
            );
        });

        it('Should not allow an empty password', function() {
            assert.throws(
                function() {
                    database.createUser('Guy', '', 'dude@webmail.com', function() { return undefined; });
                },
                Error, 'password is empty'
            );
        });

        it('Should not allow an empty email', function() {
            assert.throws(
                function() {
                    database.createUser('Guy', 'shittyPassword12', '', function() { return undefined; });
                },
                Error, 'email is empty'
            );
        });
	});

    describe('#createQuestion(title, text, submitter)', function() {
        before(function(done) {
            database.createUser('Bloke', 'badSecurity', 'bloke@shadymail.so', function(user) {
                assert.equal('Bloke', user.username);
                assert.equal('bloke@shadymail.so', user.email);
                assert(user.authenticate('badSecurity'));
                done();
            });
        });

		it('Should insert a new row in the questions table and return a new question object', function(done) {
            var beforeDate = new Date();
            database.createQuestion(
                'DAE Bernie Sanders?',
                'FEEL THE BERN!\n' +
                'EDIT 1: Holy cow, GOLD! Thanks so much!\n' +
                'EDIT 2: A second gold!?!?! Eat your heart out Leonardo! Thanks!\n' +
                'EDIT 3: I am blown away by all the gold. Thanks everyone!',
                'Bloke',
                function(question) {
                    assert.equal('DAE Bernie Sanders?', question.title);
                    assert.equal(
                        'FEEL THE BERN!\n' +
                        'EDIT 1: Holy cow, GOLD! Thanks so much!\n' +
                        'EDIT 2: A second gold!?!?! Eat your heart out Leonardo! Thanks!\n' +
                        'EDIT 3: I am blown away by all the gold. Thanks everyone!',
                        question.text
                    );
                    assert(question.date >= beforeDate);
                    assert(question.date <= new Date());
                    assert.equal('Bloke', question.submitter);
                    assert.equal(0, question.downVoteCount);
                    assert.equal(0, question.upVoteCount);
                    done();
                }
            );
		});

        it('Should not allow an empty title', function() {
            assert.throws(
                function() {
                    database.createUser('', 'typical circlejerk', 'inappropriateUsername', function() { return undefined; });
                },
                Error, 'title is empty'
            );
        });

        it('Should not allow an empty text', function() {
            assert.throws(
                function() {
                    database.createUser('AYY LMAO', '', 'inappropriateUsername', function() { return undefined; });
                },
                Error, 'text is empty'
            );
        });

        it('Should not allow an empty submitter', function() {
            assert.throws(
                function() {
                    database.createUser('AYY LMAO', 'typical circlejerk', '', function() { return undefined; });
                },
                Error, 'submitter is empty'
            );
        });
    });

    after(function(deleteDone) {
        // Delete the Users, Moderators, Admins and Questions tables
        database.rawQuery(function(error, client, done) {
            if (error) {
                throw new Error('Error creating query', error);
            }
            client.query(
                'DROP TABLE Users, Moderators, Admins, Questions;',
                function(error, result) {
                    done();
                    if (error) {
                        throw new Error('Could not drop test tables', error);
                    }
                    deleteDone();
                }
            );
        });
    });
});
