Feature: Finding New Arguments
    As an anonymous user or registered user
    In order to find the latest arguments posted to a question for a particular side without specifying a particular search query
    I should be able to view a list of all arguments, or a list of all arguments for a question, in order of chronological age

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument in favour" and ID "argument1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument in favour 2" and ID "argument2"
        And I have created an argument against with username "test_username" and question ID "question1" and text "test argument against" and ID "argument3"
        And I have created an argument against with username "test_username" and question ID "question1" and text "test argument against 2" and ID "argument4"

    Scenario: [Normal] Finding New Arguments in Favour of a Question
        Given I open the site for the question with ID "question1"
        Then I expect the page to contain the argument with ID "argument1"
        And I expect the page to contain the argument with ID "argument2"

    Scenario: [Alternate] Finding New Arguments Against a Question
        Given I open the site for the question with ID "question1"
        Then I expect the page to contain the argument with ID "argument3"
        And I expect the page to contain the argument with ID "argument4"
