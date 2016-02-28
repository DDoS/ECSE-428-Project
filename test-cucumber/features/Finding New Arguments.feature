Feature: Finding New Arguments
    As an anonymous user or registered user
    In order to find the latest arguments posted to a question for a particular side without specifying a particular search query
    I should be able to view a list of all arguments, or a list of all arguments for a question, in order of chronological age

    Scenario: [Normal] Finding New Arguments in Favour of a Question
        Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
        Then I expect that element "body" contains the partial text "$DEFAULT_TEST_ARGUMENT_PRO_TEXT"

    Scenario: [Alternate] Finding New Arguments Against a Question
        Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
        Then I expect that element "body" contains the partial text "$DEFAULT_TEST_ARGUMENT_CON_TEXT"
