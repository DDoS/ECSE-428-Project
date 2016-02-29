Feature: Finding New Questions
    As an anonymous user or registered user
    In order to find the latest questions posted to a question category without specifying a particular search query
    I should be able to view a list of all questions, or a list of all questions for a question category, in order of chronological age

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created a question with username "test_username" and question "test question 2" and details "test details 2" and ID "question2"

    Scenario: [Normal] Finding All New Questions
        Given I open the site "/questions/find"
        Then I expect the page to contain the question with ID "question1"
        And I expect the page to contain the question with ID "question2"
