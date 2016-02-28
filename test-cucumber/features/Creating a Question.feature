Feature: Creating a Question
	As a registered user
	In order to propose a topic for debate to the other users of the website
	I should be able to create a question

	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"

	Scenario: [Normal] Successfully Creating a Question with No Question Category
		Given I open the site "/questions/create"
		When I set "test question" to the inputfield "#questionInput"
		And I set "test details" to the inputfield "#detailsTextarea"
		And I click on the button "#createButton"
		Then I expect the url to contain "/questions/view"
		And I expect that element ".alert.alert-success" contains the text "New question created."

	Scenario: [Error] Attempting to Create Question with No Question
		Given I open the site "/questions/create"
		And I set "test details" to the inputfield "#detailsTextarea"
		And I click on the button "#createButton"
		Then I expect the url to contain "/questions/create"
		And I expect that element ".alert.alert-danger" contains the text "Question field is empty."

	Scenario: [Error] Attempting to Create Question with No Details
		Given I open the site "/questions/create"
		And I set "test question" to the inputfield "#questionInput"
		And I click on the button "#createButton"
		Then I expect the url to contain "/questions/create"
		And I expect that element ".alert.alert-danger" contains the text "Details field is empty."
