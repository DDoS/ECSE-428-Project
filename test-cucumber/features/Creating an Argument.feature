Feature: Creating an Argument
	As a registered user
	In order to contribute to the debate associated with a question and take a position
	I should be able to create an argument

	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"
		And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"

	Scenario: [Normal] Successfully Creating an Argument In Favour of a Question
		Given I open the site for the question with ID "question1"
		When I set "test argument for" to the inputfield "#argumentTextarea"
		And I click on the button "#forButton"
		Then I expect the url to contain the url for the question with ID "question1"
		And I expect that element ".alert.alert-success" contains the text "Argument in favour posted."

	Scenario: [Alternate] Successfully Creating an Argument Against a Question
		Given I open the site for the question with ID "question1"
		When I set "test argument against" to the inputfield "#argumentTextarea"
		And I click on the button "#againstButton"
		Then I expect the url to contain the url for the question with ID "question1"
		And I expect that element ".alert.alert-success" contains the text "Argument against posted."

	Scenario: [Error] Attempting to Create Argument with No Content
		Given I open the site for the question with ID "question1"
		And I click on the button "#forButton"
		Then I expect the url to contain the url for the question with ID "question1"
		And I expect that element ".alert.alert-danger" contains the text "Argument field is empty."
