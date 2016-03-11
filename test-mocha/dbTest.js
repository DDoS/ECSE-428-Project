var db = require('../data/db');
var assert = require('assert');
var dotenv = require('dotenv');

dotenv.load({ path: '.env' });

describe('Database', function() {
    var database = new db.Database(process.env.DBNAME_TEST);

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
                    // Check if the question is indeed in the db
                    database.getQuestion(question.id, function(getQuestion) {
                        assert.equal(question.id, getQuestion.id);
                        assert.equal(question.title, getQuestion.title);
                        assert.equal(question.text, getQuestion.text);
                        assert.equal(question.date.getTime(), getQuestion.date.getTime());
                        assert.equal(question.submitter, getQuestion.submitter);
                        done();
                    });
                }
            );
        });

        it('Should not allow an empty title', function() {
            assert.throws(
                function() {
                    database.createQuestion('', 'typical circlejerk', 'inappropriateUsername', function() {});
                },
                Error, 'title is empty'
            );
        });

        it('Should not allow an empty text', function() {
            assert.throws(
                function() {
                    database.createQuestion('AYY LMAO', '', 'inappropriateUsername', function() {});
                },
                Error, 'text is empty'
            );
        });

        it('Should not allow an empty submitter', function() {
            assert.throws(
                function() {
                    database.createQuestion('AYY LMAO', 'typical circlejerk', '', function() {});
                },
                Error, 'submitter is empty'
            );
        });
    });

    describe('findQuestions(options, getDone)', function() {
        var someDate = undefined;
        var numberAfterThatDate = 0;

        before(function(done) {
            // Create a user to submit 20 questions
            database.createUser('Spammer', 'annoying', 'fish@spam.io', function(user) {
                // Create those questions
                questions = [];
                var j = 0;
                for (var i = 0; i < 20; i++) {
                    database.createQuestion('Title' + i, 'Text' + i, 'Spammer', function(question) {
                        database.setQuestionVote(question.id, 'Spammer', question.id % 2 == 0 ? -1 : 1, function() {
                            questions.push(question);
                            if (++j >= 20) {
                                // Find the date of the question in the middle
                                someDate = questions[10].date;
                                // Count the number of questions made after it
                                questions.forEach(function(question, index, array) {
                                    if (question.date >= someDate) {
                                        numberAfterThatDate++;
                                    }
                                });
                                done();
                            }
                        });
                    });
                }
            });
        });

        it('Should return at most the 10 newest questions in descending date, when no date, limit or offset is defined',
            function(done) {
                var options = new db.SearchOptions().orderAscending();
                database.findQuestions(options, function(questions) {
                    assert.equal(10, questions.length);
                    assert(isSorted(questions, 'date'));
                    done();
                });
            }
        );

        it('Should return the newest questions in descending date, up to a given limit, when no date or offset is defined',
            function(done) {
                var options = new db.SearchOptions().withLimit(5).orderAscending();
                database.findQuestions(options, function(questions) {
                    assert.equal(5, questions.length);
                    assert(isSorted(questions, 'date'));
                    done();
                });
            }
        );

        it('Should return the newest questions in descending date, before the given date, up to a given limit when no offset is given',
            function(done) {
                var options = new db.SearchOptions().withLimit(20).withSince(someDate).orderAscending();
                database.findQuestions(options, function(questions) {
                    assert.equal(numberAfterThatDate, questions.length);
                    assert(isSorted(questions, 'date'));
                    questions.forEach(function(question, index, array) {
                        assert(question.date >= someDate);
                    });
                    done();
                });
            }
        );

        it('Should return the newest questions in descending date, up to a given limit, starting at a given offset, when no date is defined',
            function(done) {
                var options1 = new db.SearchOptions().withLimit(10).withOffset(0).orderAscending();
                database.findQuestions(options1, function(questions) {
                    // Get the first 10 questions
                    assert.equal(10, questions.length);
                    assert(isSorted(questions, 'date'));
                    // Get the other 10
                    var options2 = new db.SearchOptions().withLimit(10).withOffset(10).orderAscending();
                    database.findQuestions(options2, function(restOfQuestions) {
                        assert.equal(10, restOfQuestions.length);
                        // Append both question arrays
                        questions.forEach(function(question, index, array) {
                            array.push(restOfQuestions[index]);
                        });
                        assert(isSorted(questions, 'date'));
                        // Assert no duplicates, all questions have been returned once
                        questions.sort().forEach(function(question, index, array) {
                            assert(index == 0 || question != array[index - 1]);
                        });
                        done();
                    });
                });
            }
        );

        it('Should return the questions with given keywords', function(done) {
            var options = new db.SearchOptions().withKeywords('text1');
            database.findQuestions(options, function (questions) {
                assert.equal(1, questions.length);
                assert.equal('Title1', questions[0].title);
                assert.equal('Text1', questions[0].text);
                options.withKeywords('title3');
                database.findQuestions(options, function (questions) {
                    assert.equal(1, questions.length);
                    assert.equal('Title3', questions[0].title);
                    assert.equal('Text3', questions[0].text);
                    done();
                });
            });
        });

        it('Should optionally return the questions sorted by score', function(done) {
            var options = new db.SearchOptions().withLimit(20).orderByScore().orderAscending();
            database.findQuestions(options, function(questions) {
                var i = 0;
                questions.forEach(function(question, index, array) {
                    database.getQuestionVoteScore(question.id, function(score) {
                        question.score = score;
                        if (++i === array.length) {
                            assert(isSorted(array, 'score'));
                            done();
                        }
                    });
                });
            });
        });
    });

    describe('createArgument(questionID, type, text, submitter, createDone)', function() {
        var questionID = undefined;

        before(function(done) {
            database.createUser('Dude', 'everyoneCanSee', 'nothing@really.matters', function(user) {
                assert.equal('Dude', user.username);
                assert.equal('nothing@really.matters', user.email);
                assert(user.authenticate('everyoneCanSee'));
                assert(!user.authenticate('everyoneDanSee'));
                database.createQuestion('Hillary for president', 'This can only end well...', 'Dude', function(question) {
                    questionID = question.id;
                    done();
                });
            });
        });

        it('Should insert a new row in the arguments table and return a new argument object', function(done) {
            var beforeDate = new Date();
            database.createArgument(
                questionID,
                db.ArgumentType.CON,
                'Can\'t stump the Trump!\n' +
                    'We\'ll make them build a wall and pay for it!\n' +
                    'Make America greate a gain.\n' +
                    'Small loan of a million dollars.',
                'Dude',
                function(argument) {
                    assert.strictEqual(db.ArgumentType.CON, argument.type);
                    assert.equal(
                        'Can\'t stump the Trump!\n' +
                            'We\'ll make them build a wall and pay for it!\n' +
                            'Make America greate a gain.\n' +
                            'Small loan of a million dollars.',
                        argument.text
                    );
                    assert(argument.date >= beforeDate);
                    assert(argument.date <= new Date());
                    assert.equal('Dude', argument.submitter);
                    // Check if the question is indeed in the db
                    database.getArgument(questionID, argument.id, function(getArgument) {
                        assert.equal(argument.id, getArgument.id);
                        assert.strictEqual(argument.type, getArgument.type);
                        assert.equal(argument.text, getArgument.text);
                        assert.equal(argument.date.getTime(), getArgument.date.getTime());
                        assert.equal(argument.submitter, getArgument.submitter);
                        done();
                    });
                }
            );
        });

        it('Should not allow an undefined question', function() {
            assert.throws(
                function() {
                    database.createArgument(undefined, db.ArgumentType.PRO, 'I have an opinion', 'KenM', function() {});
                },
                Error, 'question is undefined'
            );
        });

        it('Should not allow an invalid argument type', function() {
            assert.throws(
                function() {
                    database.createArgument(questionID, 'idiot', 'I have an opinion', 'KenM', function() {});
                },
                Error, 'argument type is neither pro or con'
            );
        });

        it('Should not allow an empty text', function() {
            assert.throws(
                function() {
                    database.createArgument(questionID, db.ArgumentType.PRO, '', 'KenM', function() {});
                },
                Error, 'text is empty'
            );
        });

        it('Should not allow an empty submitter', function() {
            assert.throws(
                function() {
                    database.createArgument(questionID, db.ArgumentType.PRO, 'I have an opinion', '', function() {});
                },
                Error, 'submitter is empty'
            );
        });
    });

    describe('editArgument(questionID, id, newText, editDone)', function() {
        var questionID = undefined;
        var argumentID = undefined;

        before(function(done) {
            database.createUser('Drumpf', 'cuck', 'the@dona.ld', function(user) {
                database.createQuestion('Climate change is a chinese invention', 'to sabottage American industries', 'Drumpf', function(question) {
                    questionID = question.id;
                    database.createArgument(questionID, db.ArgumentType.PRO, 'Make America great again', 'Drumpf', function(argument) {
                        argumentID = argument.id;
                        done();
                    });
                });
            });
        });

        it('Should change the text of the argument', function(done) {
            database.editArgument(questionID, argumentID, 'HIGH ENERGY', function(editDone) {
                database.getArgument(questionID, argumentID, function(argument) {
                    assert.equal('HIGH ENERGY', argument.text);
                    done();
                });
            });
        });
    });

    describe('deleteArgument(questionID, id, deleteDone)', function() {
        var questionID = undefined;
        var argumentID = undefined;

        before(function(done) {
            database.createUser('Sanders', 'communist', 'bernie@br.os', function(user) {
                database.createQuestion('It\'s Wall Street\'s fault', 'and WalMart too', 'Sanders', function(question) {
                    questionID = question.id;
                    database.createArgument(questionID, db.ArgumentType.PRO, 'YUUUUGE', 'Sanders', function(argument) {
                        argumentID = argument.id;
                        done();
                    });
                });
            });
        });

        it('Should delete the argument', function(done) {
            database.deleteArgument(questionID, argumentID, function(deleteDone) {
                database.getArgument(questionID, argumentID, function(argument) {
                    assert.strictEqual(undefined, argument);
                    done();
                });
            });
        });
    });

    describe('findArguments(questionID, options, getDone)', function() {
        var questionID = undefined;
        var someDate = undefined;
        var numberAfterThatDate = 0;

        before(function(done) {
            // Create a user to submit one question and 20 arguments
            database.createUser('Scammer', 'freeMoney', 'memes@scam.ng', function(user) {
                database.createQuestion('Title', 'Text', 'Scammer', function(question) {
                    questionID = question.id;
                    args = [];
                    var j = 0;
                    for (var i = 0; i < 20; i++) {
                        database.createArgument(questionID, i % 2 == 0, 'Text' + i, 'Scammer', function(argument) {
                            database.setArgumentVote(questionID, argument.id, 'Scammer', argument.id % 2 == 0 ? -1 : 1, function() {
                                args.push(argument);
                                if (++j >= 20) {
                                    // Find the date of the argument in the middle
                                    someDate = args[10].date;
                                    // Count the number of arguments made after it
                                    args.forEach(function(argument, index, array) {
                                        if (argument.date >= someDate) {
                                            numberAfterThatDate++;
                                        }
                                    });
                                    done();
                                }
                            });
                        });
                    }
                });
            });
        });

        it('Should return at most the 10 newest arguments in descending date, when no type, date, limit or offset is defined',
            function(done) {
                var options = new db.SearchOptions().orderAscending();
                database.findArguments(questionID, options, function (args) {
                    assert.equal(10, args.length);
                    assert(isSorted(args, 'date'));
                    done();
                });
            }
        );

        it('Should return the newest arguments in descending date, up to a given limit, when no type, date or offset is defined',
            function(done) {
                var options = new db.SearchOptions().withLimit(5).orderAscending();
                database.findArguments(questionID, options, function (args) {
                    assert.equal(5, args.length);
                    assert(isSorted(args, 'date'));
                    done();
                });
            }
        );

        it('Should return the newest arguments in descending date, before the given date, up to a given limit when no type or offset is given',
            function(done) {
                var options = new db.SearchOptions().withSince(someDate).withLimit(20).orderAscending();
                database.findArguments(questionID, options, function (args) {
                    assert.equal(numberAfterThatDate, args.length);
                    assert(isSorted(args, 'date'));
                    args.forEach(function (argument, index, array) {
                        assert(argument.date >= someDate);
                    });
                    done();
                });
            }
        );

        it('Should return the newest arguments in descending date, up to a given limit, starting at a given offset, when no type or date is defined',
            function(done) {
                var options = new db.SearchOptions().withLimit(10).withOffset(0).orderAscending();
                database.findArguments(questionID, options, function (args) {
                    // Get the first 10 arguments
                    assert.equal(10, args.length);
                    assert(isSorted(args, 'date'));
                    // Get the other 10
                    var options = new db.SearchOptions().withLimit(10).withOffset(10).orderAscending();
                    database.findArguments(questionID, options, function (restOfArguments) {
                        assert.equal(10, restOfArguments.length);
                        // Append both argument arrays
                        args.forEach(function (argument, index, array) {
                            array.push(restOfArguments[index]);
                        });
                        assert(isSorted(args, 'date'));
                        // Assert no duplicates, all arguments have been returned once
                        args.forEach(function (argument, index, array) {
                            assert(index == 0 || argument != array[index - 1]);
                        });
                        done();
                    });
                });
            }
        );

        it('Should return at most the 10 newest arguments in descending date for the given type, when no date, limit or offset is defined',
            function(done) {
                var options = new db.SearchOptions().withType(db.ArgumentType.PRO).orderAscending();
                database.findArguments(questionID, options, function (proArgs) {
                    assert.equal(10, proArgs.length);
                    assert(isSorted(proArgs, 'date'));
                    proArgs.forEach(function (argument, index, array) {
                        assert.strictEqual(db.ArgumentType.PRO, argument.type);
                    });
                    // Now check the con args
                    var options = new db.SearchOptions().withType(db.ArgumentType.CON).orderAscending();
                    database.findArguments(questionID, options, function (conArgs) {
                        assert.equal(10, conArgs.length);
                        assert(isSorted(conArgs, 'date'));
                        conArgs.forEach(function (argument, index, array) {
                            assert.strictEqual(db.ArgumentType.CON, argument.type);
                        });
                        // Append both argument arrays
                        proArgs.forEach(function (argument, index, array) {
                            array.push(conArgs[index]);
                        });
                        // Assert no duplicates, all arguments have been returned once
                        proArgs.sort().forEach(function (argument, index, array) {
                            assert(index == 0 || argument != array[index - 1]);
                        });
                        done();
                    });
                });
            }
        );

        it('Should return the arguments with given keywords', function(done) {
            var options = new db.SearchOptions().withKeywords('text1');
            database.findArguments(questionID, options, function (args) {
                assert.equal(1, args.length);
                assert.equal('Text1', args[0].text);
                done();
            });
        });

        it('Should optionally return the arguments sorted by score', function(done) {
            var options = new db.SearchOptions().withLimit(20).orderByScore().orderAscending();
            database.findArguments(questionID, options, function(arguments) {
                var i = 0;
                arguments.forEach(function(argument, index, array) {
                    database.getArgumentVoteScore(questionID, argument.id, function(score) {
                        argument.score = score;
                        if (++i === array.length) {
                            assert(isSorted(array, 'score'));
                            done();
                        }
                    });
                });
            });
        });
    });

    describe('setQuestionVote(questionID, username, vote, setDone)', function() {
        var questionID = undefined;

        before(function(done) {
            database.createUser('Hu', 'Go', 'boss@in.c', function(user) {
                database.createUser('Man', 'ImJustA', 'goes@to.plan', function(user) {
                    database.createQuestion('UP VOTE IF JESUS', '1 UPVOTE = 1 PRAYER', 'Man', function(question) {
                        questionID = question.id;
                        done();
                    });
                });
            });
        });

        it('Should insert a new row in the questions vote table when vote is up or down', function(done) {
            database.setQuestionVote(questionID, 'Hu', db.VoteType.DOWN, function() {
                database.getQuestionVote(questionID, 'Hu', function(vote) {
                    assert.equal(db.VoteType.DOWN, vote);
                    // Update the vote
                    database.setQuestionVote(questionID, 'Hu', db.VoteType.UP, function() {
                        database.getQuestionVote(questionID, 'Hu', function(updated) {
                            assert.equal(db.VoteType.UP, updated);
                            done();
                        });
                    });
                });
            });
        });

        it('Should insert delete the row in the questions vote table when vote is none', function(done) {
            database.setQuestionVote(questionID, 'Man', db.VoteType.DOWN, function() {
                database.getQuestionVote(questionID, 'Man', function(vote) {
                    assert.equal(db.VoteType.DOWN, vote);
                    // Delete the vote
                    database.setQuestionVote(questionID, 'Man', db.VoteType.NONE, function() {
                        database.getQuestionVote(questionID, 'Man', function(deleted) {
                            assert.equal(db.VoteType.NONE, deleted);
                            done();
                        });
                    });
                });
            });
        });

        it('Should not allow an undefined question ID', function() {
            assert.throws(
                function() {
                    database.setQuestionVote(undefined, 'Man', db.VoteType.UP, function() {});
                },
                Error, 'question ID is undefined'
            );
        });

        it('Should not allow an empty username', function() {
            assert.throws(
                function() {
                    database.setQuestionVote(questionID, '', db.VoteType.UP, function() {});
                },
                Error, 'username is empty'
            );
        });

        it('Should not allow an invalid vote type', function() {
            assert.throws(
                function() {
                    database.setQuestionVote(questionID, 'Man', undefined, function() {});
                },
                Error, 'vote type is neither up, down or none'
            );
        });
    });

    describe('setArgumentVote(questionID, argumentID, username, vote, setDone)', function() {
        var questionID = undefined;
        var argumentID = undefined;

        before(function(done) {
            database.createUser('Im', 'tired', 'of@coming.up', function(user) {
                database.createUser('with', 'original', 'names@for.testing', function(user) {
                    database.createQuestion('JUST UPVOTE THIS SHIT', 'NO EFFORT', 'Im', function(question) {
                        questionID = question.id;
                        database.createArgument(questionID, db.ArgumentType.CON, 'LOL NO', 'with', function(argument){
                            argumentID = argument.id;
                            done();
                        });
                    });
                });
            });
        });

        it('Should insert a new row in the argument vote table when vote is up or down', function(done) {
            database.setArgumentVote(questionID, argumentID, 'Im', db.VoteType.DOWN, function() {
                database.getArgumentVote(questionID, argumentID, 'Im', function(vote) {
                    assert.equal(db.VoteType.DOWN, vote);
                    // Update the vote
                    database.setArgumentVote(questionID, argumentID, 'Im', db.VoteType.UP, function() {
                        database.getArgumentVote(questionID, argumentID, 'Im', function(updated) {
                            assert.equal(db.VoteType.UP, updated);
                            done();
                        });
                    });
                });
            });
        });

        it('Should insert delete the row in the questions vote table when vote is none', function(done) {
            database.setArgumentVote(questionID, argumentID, 'with', db.VoteType.DOWN, function() {
                database.getArgumentVote(questionID, argumentID, 'with', function(vote) {
                    assert.equal(db.VoteType.DOWN, vote);
                    // Delete the vote
                    database.setArgumentVote(questionID, argumentID, 'with', db.VoteType.NONE, function() {
                        database.getArgumentVote(questionID, argumentID, 'with', function(deleted) {
                            assert.equal(db.VoteType.NONE, deleted);
                            done();
                        });
                    });
                });
            });
        });

        it('Should not allow an undefined question ID', function() {
            assert.throws(
                function() {
                    database.setArgumentVote(undefined, argumentID, 'Im', db.VoteType.UP, function() {});
                },
                Error, 'question ID is undefined'
            );
        });

        it('Should not allow an undefined argument ID', function() {
            assert.throws(
                function() {
                    database.setArgumentVote(questionID, undefined, 'Im', db.VoteType.UP, function() {});
                },
                Error, 'argument ID is undefined'
            );
        });

        it('Should not allow an empty username', function() {
            assert.throws(
                function() {
                    database.setArgumentVote(questionID, argumentID, '', db.VoteType.UP, function() {});
                },
                Error, 'username is empty'
            );
        });

        it('Should not allow an invalid vote type', function() {
            assert.throws(
                function() {
                    database.setArgumentVote(questionID, argumentID, 'Im', undefined, function() {});
                },
                Error, 'vote type is neither up, down or none'
            );
        });
    });

    describe('getQuestionVoteScore(questionID, getDone)', function() {
        var questionID = undefined;

        before(function(done) {
            database.createUser('More', 'Bull', 'shit@to.write', function(user) {
                database.createUser('Another', 'Wanker', 'no@one.cares', function(user) {
                    database.createQuestion('I ONLY SPEAK TO SAILORS', 'ECH', 'More', function(question) {
                        questionID = question.id;
                        done();
                    });
                });
            });
        });

        it('Should return the sum of votes for a question', function(done) {
            database.getQuestionVoteScore(questionID, function(score1) {
                // No votes
                assert.equal(0, score1);
                database.setQuestionVote(questionID, 'More', db.VoteType.DOWN, function() {
                    database.getQuestionVoteScore(questionID, function(score2) {
                        // One down vote
                        assert.equal(-1, score2);
                        database.setQuestionVote(questionID, 'Another', db.VoteType.UP, function() {
                            database.getQuestionVoteScore(questionID, function(score3) {
                                // One down and one up vote
                                assert.equal(0, score3);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('Should return 0 for a non existant question', function(done) {
            database.getQuestionVoteScore(0, function(score) {
                assert.equal(0, score);
                done();
            });
        });
    });

    describe('getArgumentVoteScore(questionID, argumentID, getDone)', function() {
        var questionID = undefined;
        var argumentID = undefined;

        before(function(done) {
            database.createUser('OK', 'this', 'is@a.thing', function(user) {
                database.createUser('Hey', 'you', 'over@there.my', function(user) {
                    database.createQuestion('TFIU by spelling "TIFU" wrong', 'I have a GF btw', 'OK', function(question) {
                        questionID = question.id;
                        database.createArgument(questionID, db.ArgumentType.PRO, 'TIL', 'Hey', function(argument){
                            argumentID = argument.id;
                            done();
                        });
                    });
                });
            });
        });

        it('Should return the sum of votes for an argument', function(done) {
            database.getArgumentVoteScore(questionID, argumentID, function(score1) {
                // No votes
                assert.equal(0, score1);
                database.setArgumentVote(questionID, argumentID, 'OK', db.VoteType.UP, function() {
                    database.getArgumentVoteScore(questionID, argumentID, function(score2) {
                        // One up vote
                        assert.equal(1, score2);
                        database.setArgumentVote(questionID, argumentID, 'Hey', db.VoteType.UP, function() {
                            database.getArgumentVoteScore(questionID, argumentID, function(score3) {
                                // Two up votes
                                assert.equal(2, score3);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('Should return 0 for a non existant argument', function(done) {
            database.getArgumentVoteScore(questionID, 0, function(score) {
                assert.equal(0, score);
                done();
            });
        });
    });

    after(function(deleteDone) {
        database.clear(function() {
            deleteDone();
        });
    });
});

function isSorted(array, field) {
    return array.every(function(value, index, array) {
        if (index === 0) {
            return true
        }
        return array[index - 1][field] <= value[field];
    });
}
