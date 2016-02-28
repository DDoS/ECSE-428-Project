sort_question.feature
# Gherkin Acceptance Test for Sorting Question Search Result

Feature: Sorting Questions Search Results
    Given I am an anonymous user or a registered / logged-in user
    And I want to view the searched questions in some order
    I should be able to sort the questions by date or vote score

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


    Scenario: [Normal] Obtain question search results in descending order by date
        When I set "details" to the inputfield "#search"
        And I click on the button "#dateDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Newest First"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Alternate] Obtain question search results in ascending order by date
        When I set "details" to the inputfield "#search"
        And I click on the button "#dateAcs"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Oldest First"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Alternate] Obtain question search results in descending order by vote score
        When I set "details" to the inputfield "#search"
        And I click on the button "#voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Alternate] Obtain question search results in ascending order by vote score
        When I set "details" to the inputfield "#search"
        And I click on the button "#voteAcs"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Lowest Score First"
        And I expect that element "body" contains the partial text "test question details"

    Scenario: [Error] Obtain question Search Results failed due to empty keywords
        When I set " " to the inputfield "#search"
	And I click on the button "voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."

    Scenario: [Error] Obtain question Search Results failed due to no questions
        When I set "no_expected_matches" to the inputfield "#search"
	And I click on the button "voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element "#noQuestionMsg" contains the text "No results found."
