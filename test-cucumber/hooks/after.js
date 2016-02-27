var AfterHook = module.exports = function (done) {

	// // Clear db and close server
	// var app = require('../../app');
	// //var db = require("../../data/db");
	// //var session = require('supertest-session');

 //    app.database.clear();

    this.browser.end(done);
};
