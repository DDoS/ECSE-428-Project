sort_argument.feature
# Gherkin Acceptance Test for Sorting Argument Search Result

Feature: Sorting Arguments Search Results
    Given I am an anonymous user or a registered / logged-in user
    And I want to view the searched arguments in some order
    I should be able to sort the arguments by date or score

    Background:
        Given I open the site "/users/login"
        When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
        When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
        And I click on the button "#login"

	Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
	And I set "test argument details" to the inputfield "#argument"
	And I click on the button "#pro"

        Given I open the site "/arguments/find"
        Then I expect that element "body" contains the partial text "test argument details"


    Scenario: [Normal] Obtain argument search results in descending order by date
        When I set "details" to the inputfield "#search"
        And I click on the button "#dateDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Newest First"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Alternate] Obtain argument search results in ascending order by date
        When I set "details" to the inputfield "#search"
        And I click on the button "#dateAcs"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Oldest First"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Alternate] Obtain argument search results in descending order by vote score
        When I set "details" to the inputfield "#search"
        And I click on the button "#voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Alternate] Obtain argument search results in ascending order by vote score
        When I set "details" to the inputfield "#search"
        And I click on the button "#voteAcs"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Lowest Score First"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Error] Obtain argument Search Results failed due to empty keywords
        When I set " " to the inputfield "#search"
	And I click on the button "voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."

    Scenario: [Error] Obtain argument Search Results failed due to no questions
        When I set "no_expected_matches" to the inputfield "#search"
	And I click on the button "voteDes"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
	And I expect the url to contain "#Highest Score First"
        And I expect that element "#noArgumentMsg" contains the text "No results found."
