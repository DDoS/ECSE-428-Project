var db = require('../data/db');
var assert = require('assert');
var dotenv = require('dotenv');

dotenv.load({ path: '.env' });
var dbName = process.env.DBNAME_TEST;

describe('Database', function() {
    var database = new db.Database(dbName);

    before(function(done) {
        // Create the Users, Moderators, Admins and Questions tables
        database.initialize(done);
    });

    describe('createUser(username, password, email, createDone)', function() {
        it('Should insert a new row in the user table and return a new user object', function(done) {
            database.createUser('Guy', 'shittyPassword12', 'dude@webmail.com', function(user) {
                assert.equal('Guy', user.username);
                assert.equal('dude@webmail.com', user.email);
                assert(user.authenticate('shittyPassword12'));
                assert(!user.authenticate('notMyPassword'));
                // Check if the user is indeed in the db
                database.getUser('Guy', function(getUser) {
                    assert.equal('Guy', getUser.username);
                    assert.equal('dude@webmail.com', getUser.email);
                    assert(getUser.authenticate('shittyPassword12'));
                    assert(!getUser.authenticate('notMyPassword'));
                    done();
                });
            });
        });

        it('Should not allow an empty username', function() {
            assert.throws(
                function() {
                    database.createUser('', 'shittyPassword12', 'dude@webmail.com', function() {});
                },
                Error, 'username is empty'
            );
        });

        it('Should not allow an empty password', function() {
            assert.throws(
                function() {
                    database.createUser('Guy', '', 'dude@webmail.com', function() {});
                },
                Error, 'password is empty'
            );
        });

        it('Should not allow an empty email', function() {
            assert.throws(
                function() {
                    database.createUser('Guy', 'shittyPassword12', '', function() {});
                },
                Error, 'email is empty'
            );
        });
    });

    describe('createQuestion(title, text, submitter, createDone)', function() {
        before(function(done) {
            database.createUser('Bloke', 'badSecurity', 'bloke@shadymail.so', function(user) {
                assert.equal('Bloke', user.username);
                assert.equal('bloke@shadymail.so', user.email);
                assert(user.authenticate('badSecurity'));
                assert(!user.authenticate('badSecuritz'));
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
                    assert.equal(1, question.id);
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
                    // Check if the question is indeed in the db
                    database.getQuestion(question.id, function(getQuestion) {
                        assert.equal(question.id, getQuestion.id);
                        assert.equal(question.title, getQuestion.title);
                        assert.equal(question.text, getQuestion.text);
                        assert.equal(question.date.getTime(), getQuestion.date.getTime());
                        assert.equal(question.submitter, getQuestion.submitter);
                        assert.equal(question.downVoteCount, getQuestion.downVoteCount);
                        assert.equal(question.upVoteCount, getQuestion.upVoteCount);
                        done();
                    });
                }
            );
        });

        it('Should not allow an empty title', function() {
            assert.throws(
                function() {
                    database.createUser('', 'typical circlejerk', 'inappropriateUsername', function() {});
                },
                Error, 'title is empty'
            );
        });

        it('Should not allow an empty text', function() {
            assert.throws(
                function() {
                    database.createUser('AYY LMAO', '', 'inappropriateUsername', function() {});
                },
                Error, 'text is empty'
            );
        });

        it('Should not allow an empty submitter', function() {
            assert.throws(
                function() {
                    database.createUser('AYY LMAO', 'typical circlejerk', '', function() {});
                },
                Error, 'submitter is empty'
            );
        });
    });

    describe('getNewQuestions(since, limit, getDone)', function() {
        var someDate = undefined;
        var numberAfterThatDate = 0;

        before(function(done) {
            // Create a user to submit 100 questions
            database.createUser('Spammer', 'annoying', 'fish@spam.io', function() {});
            // Create those questions
            questions = [];
            var j = 0;
            for (var i = 0; i < 100; i++) {
                database.createQuestion('Title', 'Text', 'Spammer', function(question) {
                    questions.push(question);
                    if (++j >= 100) {
                        // Find the date of the question in the middle
                        someDate = questions[50].date;
                        // Count the number of questions made after it
                        questions.forEach(function(question, index, array) {
                            if (question.date >= someDate) {
                                numberAfterThatDate++;
                            }
                        });
                        done();
                    }
                });
            }
        });

        it('Should return at most the 10 newest questions in descending date, when no date, limit or offset is defined',
            function(done) {
                database.getNewQuestions(undefined, undefined, undefined, function(questions) {
                    assert.equal(10, questions.length);
                    assert(isSorted(questions));
                    done();
                }
            );
        });

        it('Should return the newest questions in descending date, up to a given limit, when no date or offset is defined',
            function(done) {
                database.getNewQuestions(undefined, 50, undefined, function(questions) {
                    assert.equal(50, questions.length);
                    assert(isSorted(questions));
                    done();
                }
            );
        });

        it('Should return the newest questions in descending date, before the given date, up to a given limit when no offset is given',
            function(done) {
                database.getNewQuestions(someDate, 100, undefined, function(questions) {
                    assert.equal(numberAfterThatDate, questions.length);
                    assert(isSorted(questions));
                    questions.forEach(function(question, index, array) {
                        assert(question.date >= someDate);
                    });
                    done();
                }
            );
        });

        it('Should return the newest questions in descending date, up to a given limit, starting at a given offset, when no date is defined',
            function(done) {
                database.getNewQuestions(undefined, 50, 0, function(questions) {
                    // Get the first 50 questions
                    assert.equal(50, questions.length);
                    assert(isSorted(questions));
                    // Get the other 50
                    database.getNewQuestions(undefined, 50, 50, function(restOfQuestions) {
                        assert.equal(50, restOfQuestions.length);
                        // Append both question arrays
                        questions.forEach(function(question, index, array) {
                            array.push(restOfQuestions[index]);
                        });
                        assert(isSorted(questions));
                        // Assert no duplicates, all questions have been returned once
                        questions.sort().forEach(function(question, index, array) {
                            assert(index == 0 || question != array[index - 1]);
                        });
                        done();
                    });
                }
            );
        });

        it('Should not allow since dates in the future', function() {
            assert.throws(
                function() {
                    database.getNewQuestions(new Date('2018-01-01'), undefined, function() {});
                },
                Error, 'Since date is in the future'
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

function isSorted(array) {
    return array.every(function(value, index, array) {
      return index === 0 || array[index - 1] <= value;
    });
}
