search_argument.feature
# Gherkin Acceptance Test for Searching Arguments

Feature: Search for an Argument
	Given I am an anonymous user or registered user
	And I want to find a particular argument or an argument that contains specific keywords
	I should be able to search for that argument by viewing a list of arguments matching particular keywords

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

    Scenario: [Normal] Obtain argument search results using one keyword
        When I set "details" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguements/find"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Alternate] Obtain argument search results using multiple keywords
        When I set "test argument details" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
        And I expect that element "body" contains the partial text "test argument details"

    Scenario: [Error] Obtain argument search results failed due to empty keyword field
        When I set " " to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/arguments/find"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."

    Scenario: [Error] Obtain argument search results failed due to no matches
        When I set "no_expected_matches" to the inputfield "#search"
        And I click on the button "#submitSearch"
        Then I expect the url to contain "/questions/find"
        And I expect that element "#noArgumentMsg" contains the text "No results found."