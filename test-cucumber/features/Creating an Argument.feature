Feature: Creating an Argument
	As a registered user
	In order to contribute to the debate associated with a question and take a position
	I should be able to create an argument

	Background:
		Given I open the site "/users/login"
		When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
		When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
		And I click on the button "#login"

	Scenario: [Normal] Successfully Creating an Argument In Favour of a Question
		Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
		When I set "argument_in_favour" to the inputfield "#argument"
		And I click on the button "#pro"
		Then I expect the url to contain "$DEFAULT_TEST_QUESTION_VIEW_URL"
		And I expect that element ".alert.alert-success" contains the text "Argument in favour posted."

	Scenario: [Alternate] Successfully Creating an Argument Against a Question
		Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
		When I set "argument_against" to the inputfield "#argument"
		And I click on the button "#con"
		Then I expect the url to contain "$DEFAULT_TEST_QUESTION_VIEW_URL"
		And I expect that element ".alert.alert-success" contains the text "Argument against posted."

	Scenario: [Error] Attempting to Create Argument with No Content
		Given I open the site "$DEFAULT_TEST_QUESTION_VIEW_URL"
		And I click on the button "#pro"
		Then I expect the url to contain "$DEFAULT_TEST_QUESTION_VIEW_URL"
		And I expect that element ".alert.alert-danger" contains the text "Argument field is empty."
