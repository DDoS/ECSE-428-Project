
var host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || process.env.PGHOST;
var port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || process.env.PGPORT;
var user = process.env.OPENSHIFT_POSTGRESQL_DB_USER || process.env.PGUSER;
var password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.PGPASSWORD;

var Database = function() {
    var self = this;

    self.test = function() {
        console.log(host);
        console.log(port);
        console.log(user);
        console.log(password);
    }
}

module.exports.Database = Database;
