    self.editArgument = function(questionID, id, newText, getDone) {
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
                    'UPDATE ' + argumentTable +
                        ' SET text = $1 ' + ' WHERE questionID = $2 AND id = $3;',
                    [newText, questionID, id],
                    function(error) {
                        done();
                        if (error) {
                            console.error(error);
                            throw new Error('Could not get argument');
                        }
                        var argument;
                        if (result.rows.length <= 0) {
                            argument = undefined;
                        } else {
                            argument = new Argument(
                                id, result.rows[0].type, newText, result.rows[0].date,
                                result.rows[0].submitter
                            );
                        }
                        getDone(argument);
                    }
                );
            }
        );
    };