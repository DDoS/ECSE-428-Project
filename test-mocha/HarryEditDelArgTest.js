    describe('editArgument(questionID, id, newText, getDone)', function() {
        var questionID = undefined;
        var id = undefined;

        var aUser = 'User';
        var aPassword = 'passWord';
        var aEmail = 'address@mail.com';

        var qTitle = 'DB Unit Test';
        var qText = 'This is a test.';
        var aTitle = 'Text Case 1';
        var aText = 'This is old text.';

        before(function(done) {
            database.createUser(aUser, aPassword, aEmail, function(user) {
                assert.equal(aUser, user.username);
                assert.equal(aEmail, user.email);
                assert(user.authenticate(aPassword));
                database.createQuestion(qTitle, qText, aUser, function(question) {
                    questionID = question.id;
                    done();
                });
                database.createArgument(aTitle, db.ArgumentType.PRO, aText, aUser, function(argument) {
                    id = argument.id;
                    done();
                });
            });
        });

        it('Should update the text column at a selected row in the arguments table and return a new argument object', function(done) {
            var beforeDate = new Date();
            var newText = 'Hello World! I am new text!';
            database.editArgument(questionID, id, newText,
                function(argument) {
                    assert.equal(id, argument.id);
                    assert.strictEqual(db.ArgumentType.PRO, argument.type);
                    assert.equal(newText, argument.text);
                    assert(argument.date >= beforeDate);
                    assert(argument.date <= new Date());
                    assert.equal(aUser, argument.submitter);
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
    });

    describe('editArgument(newText, questionID, id, getDone)', function() {
        var questionID = undefined;
        var id = undefined;

        var aUser = 'User';
        var aPassword = 'passWord';
        var aEmail = 'address@mail.com';

        var qTitle = 'DB Unit Test';
        var qText = 'This is a test.';
        var aTitle = 'Text Case 1';
        var aText = 'This is old text.';

        before(function(done) {
            database.createUser(aUser, aPassword, aEmail, function(user) {
                assert.equal(aUser, user.username);
                assert.equal(aEmail, user.email);
                assert(user.authenticate(aPassword));
                database.createQuestion(qTitle, qText, aUser, function(question) {
                    questionID = question.id;
                    done();
                });
                database.createArgument(aTitle, db.ArgumentType.PRO, aText, aUser, function(argument) {
                    id = argument.id;
                    done();
                });
            });
        });

        it('Should remove selected row from the arguments table and return an undefined argument object', function(done) {
            database.deleteArgument(questionID, id,
                function(argument) {
                    assert.strictEqual(null, argument);
                }
            );
        });
    });