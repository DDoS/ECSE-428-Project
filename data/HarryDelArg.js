    self.deleteArgument = function(questionID, id, getDone) {
        if (questionID === undefined) {
            throw new Error('question ID is undefined');
        }
        pg.connect(
            config,
            function(error, client, done) {
                if (error) {
                    console.error(error);
                    throw new Error('Error creating query');
                }
                client.query(
                    'DELETE FROM ' + argumentTable +
                        ' WHERE questionID = $1 AND id = $2;',
                    [questionID, id],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get argument');
                        }
                        var argument;
                        if (result.rows.length < 0) {
                            argument = undefined;
                        } else {
                            argument = null;
                        }
                        getDone(argument);
                    }
                );
            }
        );
    };