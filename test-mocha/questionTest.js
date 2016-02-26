var assert = require('assert');
var dotenv = require('dotenv');
var session = require('supertest-session');

describe('questions', function() {
    var app;
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

    describe('/create', function() {
        it('should fail to create a question with no title', function(done) {
            request.post('/questions/create')
                .send({'title': '', text: 'text'})
                .end(function() {
                    done();
                });
        });
    });

    after(function(done) {
        server.close();
        done();
    });
});