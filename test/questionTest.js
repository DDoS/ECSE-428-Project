/**
 * Created by Baizhong Zhang on 2016/2/5.
 */

var db = require('../data/db');
var assert = require('assert');
var dotenv = require('dotenv');

var express = require('express');
var router = express.Router();

//dotenv.load

describe("GET and POST", function(){
    it('POST a question and should GET the same question by applying router.post and .get functions', function(done) {
        var postQ = router.post('/create', function (req, res) {
            req.app.get('db').createQuestion("title", "text", "baizhong", function (question) {
            });
        });
        console.log('POST'+ postQ);
        var getQ = router.get('/create', function (req, res) {
            req.app.get('db').createQuestion(undefined,undefined, page * 10, function (questions) {
            });
        });
        console.log('GET'+ getQ);
        assert.equal(postQ, getQ);
        done();
    });
});