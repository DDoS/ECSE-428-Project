Feature: Downvoting a Question
    As a registered user
    In order to indicate my belief that a question is not worthy of debate and to decrease the chance that other users will see it
    I should be able to downvote that question

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I am logged into the account with username "test_username" and password "test_password"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created a question with username "test_username" and question "test question 2" and details "test details 2" and ID "question2"
        And I have created a question with username "test_username" and question "test question 3" and details "test details 3" and ID "question3"
        And I have upvoted the question with username "test_username" and ID "question3"
        And I have created a question with username "test_username" and question "test question 4" and details "test details 4" and ID "question4"
        And I have downvoted the question with username "test_username" and ID "question4"

    Scenario: Downvoting a Question From a List of Questions
        Given I open the site "/questions/find"
        When I downvote the question with username "test_username" and ID "question1"
        Then I expect the url to contain "/questions/find"
        Then I expect that element ".alert.alert-success" contains the text "Downvote recorded."
        Then I expect the question with ID "question1" to have a score of "-1"

    Scenario: Downvoting a Question From the Question Page
        Given I open the site for the question with ID "question2"
        When I downvote the question with username "test_username" and ID "question2"
        Then I expect the url to contain the url for the question with ID "question2"
        Then I expect that element ".alert.alert-success" contains the text "Downvote recorded."
        Then I expect the question with ID "question2" to have a score of "-1"

    Scenario: Downvoting an Upvoted Question
        Given I open the site "/questions/find"
        When I downvote the question with username "test_username" and ID "question3"
        Then I expect the url to contain "/questions/find"
        Then I expect that element ".alert.alert-success" contains the text "Downvote recorded."
        Then I expect the question with ID "question3" to have a score of "-1"

    Scenario: Downvoting an Downvoted Question
        Given I open the site "/questions/find"
        When I downvote the question with username "test_username" and ID "question4"
        Then I expect the url to contain "/questions/find"
        Then I expect that element ".alert.alert-success" contains the text "Vote removal recorded."
        Then I expect the question with ID "question4" to have a score of "0"
