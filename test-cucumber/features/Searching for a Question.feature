Feature: Search for a Question
    As an anonymous user or registered user
    In order to find a particular question or a question that I will find interesting
    I should be able to search for that question by viewing a list of all questions with particular terms

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question" and details "aaa bbb ccc" and ID "question1"
        And I have created a question with username "test_username" and question "test question" and details "ddd eee fff" and ID "question2"
        And I have created a question with username "test_username" and question "test question" and details "aaa bbb ccc ddd eee fff" and ID "question3"
        And I have created a question with username "test_username" and question "test question" and details "bbb ggg" and ID "question4"

    Scenario: [Normal] Obtaining Question Search Results Using One Keyword
        Given I open the site "/questions/find"
        When I set "aaa" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question1"
        Then I expect the page to not contain the question with ID "question2"
        Then I expect the page to contain the question with ID "question3"
        Then I expect the page to not contain the question with ID "question4"

    Scenario: [Alternate] Obtaining Question Search Results Using Miltiple Keywords
        Given I open the site "/questions/find"
        When I set "aaa bbb ccc" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question1"
        Then I expect the page to not contain the question with ID "question2"
        Then I expect the page to contain the question with ID "question3"
        Then I expect the page to contain the question with ID "question4"

    Scenario: [Error] Attempting to Obtain Question Search Results Using No Keywords
        Given I open the site "/questions/find"
        And I click on the button "#searchButton"
        Then I expect the url to contain "/questions/find"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."
        Then I expect the page to not contain the question with ID "question1"
        Then I expect the page to not contain the question with ID "question2"
        Then I expect the page to not contain the question with ID "question3"
        Then I expect the page to not contain the question with ID "question4"

    Scenario: [Error] Obtain question search results failed due to no matches
        Given I open the site "/questions/find"
        When I set "hhh" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain "/questions/find"
        And I expect that element "#noQuestionsPara" contains the text "No results found."
        Then I expect the page to not contain the question with ID "question1"
        Then I expect the page to not contain the question with ID "question2"
        Then I expect the page to not contain the question with ID "question3"
        Then I expect the page to not contain the question with ID "question4"
