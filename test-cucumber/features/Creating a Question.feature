Feature: Creating a Question
	As a registered user
	In order to propose a topic for debate to the other users of the website
	I should be able to create a question

	Background:
		Given I open the site "/users/login"
		When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
		When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
		And I click on the button "#login"

	Scenario: [Normal] Successfully Creating a Question with No Question Category
		Given I open the site "/questions/create"
		When I set "test_question_question" to the inputfield "#question"
		And I set "test_question_details" to the inputfield "#details"
		And I click on the button "#create"
		Then I expect the url to contain "/questions/view"
		And I expect that element ".alert.alert-success" contains the text "New question created."

	Scenario: [Error] Attempting to Create Question with No Question
		Given I open the site "/questions/create"
		And I set "test_question_details" to the inputfield "#details"
		And I click on the button "#create"
		Then I expect the url to contain "/questions/create"
		And I expect that element ".alert.alert-danger" contains the text "Question field is empty."

	Scenario: [Error] Attempting to Create Question with No Details
		Given I open the site "/questions/create"
		And I set "test_question_question" to the inputfield "#question"
		And I click on the button "#create"
		Then I expect the url to contain "/questions/create"
		And I expect that element ".alert.alert-danger" contains the text "Details field is empty."
