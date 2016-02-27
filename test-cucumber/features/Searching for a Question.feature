Feature: Search for a Question
    As an anonymous user or registered user
    In order to find a particular question or a question that I will find interesting
    I should be able to search for that question by viewing a list of all questions with particular terms

    Background:
        Given I open the site "/users/login"
        When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
        When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
        And I click on the button "#login"

        Given I open the site "/questions/create"
        When I set "test_question_question" to the inputfield "#question"
        And I set "test question details" to the inputfield "#details"
        And I click on the button "#create"

        Given I open the site "/questions/find"
        Then I expect that element "body" contains the partial text "test_question_question"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Normal] Obtain question search results using one keyword
        When I set "details" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/search"
        And I expect that element "body" contains the partial text "test_question_question"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Alternate] Obtain question search results using multiple keywords
        When I set "test question details" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/search"
        And I expect that element "body" contains the partial text "test_question_question"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Error] Obtain question search results failed due to empty keyword field
        When I set " " to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."

    Scenario: [Error] Obtain question search results failed due to no matches
        When I set "no_expected_matches" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/search"
        And I expect that element "#noQuestionMsg" contains the text "No results found."
