Feature: Upvoting a Argument
    As a registered user
    In order to indicate my belief that an argument makes a valid point supported by evidence and to increase the chance that other users will see it
    I should be able to upvote that argument

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I am logged into the account with username "test_username" and password "test_password"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 1" and ID "argument1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 2" and ID "argument2"
        And I have downvoted the argument with username "test_username" and question ID "question1" and ID "argument2"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 3" and ID "argument3"
        And I have upvoted the argument with username "test_username" and question ID "question1" and ID "argument3"

    Scenario: [Normal] Upvoting a Argument From a Question Page
        Given I open the site for the question with ID "question1"
        When I upvote the argument with ID "argument1"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect that element ".alert.alert-success" contains the text "Upvote recorded."
        Then I expect the argument with ID "argument1" to have a score of "1"

    Scenario: [Alternate] Upvoting a Downvoted Argument
        Given I open the site for the question with ID "question1"
        When I upvote the argument with ID "argument2"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect that element ".alert.alert-success" contains the text "Upvote recorded."
        Then I expect the argument with ID "argument2" to have a score of "1"

    Scenario: [Alternate] Upvoting an Upvoted Argument
        Given I open the site for the question with ID "question1"
        When I upvote the argument with ID "argument3"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect that element ".alert.alert-success" contains the text "Vote removal recorded."
        Then I expect the argument with ID "argument3" to have a score of "0"
