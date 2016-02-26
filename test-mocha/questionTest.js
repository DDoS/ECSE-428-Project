var assert = require('assert');

var dotenv = require('dotenv');
var session = require('supertest-session');

describe('/questions', function() {
    var app;
    var database;
    var server;
    var request;

    before(function(done) {
        dotenv.load({path: __dirname + '/../.env'});
        process.env.NODE_ENV = 'test';

        app = require('../app');

        app.set('port', 8080);
        app.set('ipaddress', '127.0.0.1');

        app.get('initDb')(function() {
            server = app.listen(app.get('port'), app.get('ipaddress'), function() {
                database = app.get('db');
                request = session(server);
                done();
            });
        });
    });

    before(function(done) {
        app.get('db').createUser('test', 'testpass123', 'test@test.com', function() {
            request.post('/users/login')
                .send({username: 'test', password: 'testpass123'})
                .end(function() {
                    done();
                });
        });
    });

    describe('/questions/create', function() {
        it('should show the "Create New Question" page', function(done) {
            request.get('/questions/create')
                .end(function(err, res) {
                    assert.ok(res.text.indexOf('Create New Question') !== -1,
                        'response should contain "Create New Question"');
                    done();
                });
        });

        it('should fail to create a question with no question', function(done) {
            request.post('/questions/create')
                .send({question: '', details: 'details'})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                                 'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Question field is empty.') !== -1,
                                  'response should contain "Question field is empty."');
                        done();
                    });
                });
        });

        it('should fail to create a question with no details', function(done) {
            request.post('/questions/create')
                .send({question: 'question', details: ''})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Details field is empty.') !== -1,
                            'response should contain "Details field is empty."');
                        done();
                    });
                });
        });

        it('should fail to create a question with neither question nor details', function(done) {
            request.post('/questions/create')
                .send({question: '', details: ''})
                .end(function(err, res) {
                    assert.equal(res.header.location, 'create',
                        'redirect to "create" expected');
                    request.get('/questions/create').end(function(err, res) {
                        assert.ok(res.text.indexOf('Question field is empty.') !== -1,
                            'response should contain "Question field is empty."');
                        assert.ok(res.text.indexOf('Details field is empty.') !== -1,
                            'response should contain "Details field is empty."');
                        done();
                    });
                });
        });

        it('should successfully create a question with question and details', function(done) {
            request.post('/questions/create')
                .send({question: 'question_test', details: 'details_test'})
                .end(function(err, res) {
                    var matches = res.header.location.match(/^view\?q=([0-9]+)$/);
                    assert.ok(matches !== null, 'redirect to "view?q={qid}" expected');
                    dbValidation();

                    function dbValidation() {
                        database.getQuestion(matches[1], function(question) {
                            assert.equal(question.title, 'question_test');
                            assert.equal(question.text, 'details_test');
                            pageValidation();
                        });
                    }

                    function pageValidation() {
                        request.get('/questions/' + res.header.location)
                            .expect(200)
                            .end(function() {
                                done();
                            })
                    }
                });
        });
    });

    after(function(done) {
        app.get('db').clear(function() {
            server.close();
            done();
        });
    });
});