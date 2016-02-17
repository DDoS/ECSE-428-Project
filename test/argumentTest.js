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
    it('POST a question and should GET the same argument by applying router.post and .get functions', function(done) {
       var questionID = 1;
        var postQ = router.post('/create', function (req, res) {
            req.app.get('db').createArgument(questionID,db.ArgumentType.PRO,"test text",'baizhong',function(arguments) {
            });
        });
        var getQ = router.get('/create', function (req, res) {
            req.app.get('db').getNewArguments(questionID,db.ArgumentType.PRO, undefined, undefined, undefined, function(arguments) {
            });
        });
        assert.equal(postQ, getQ);
        done();
    });
});
