Feature: Deleting a Question
	As a registered user
	In order to make sure that a question that I created and posted will no longer appear on the website
	I should be able to delete that question
	 
	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"

	Scenario: [Normal] Delete the question successfully
		Given I open the site for the question with ID "question1"
		And a prompt is not opened
		When I click on the element "#deleteButton"
		Then I wait on element "#deleteModal" to be enabled
		And I wait on element "#realDeleteButton" to be visible
		When I click on the button "#realDeleteButton"
		Then I expect the url to contain "/questions/find"
		And I expect that element ".alert.alert-success" contains the text "Question deleted."

	Scenario: [Alternate] Cancel delete when asked for confirmation
		Given I open the site for the question with ID "question1"
		And a prompt is not opened
		When I click on the element "#deleteButton"
		Then I wait on element "#deleteModal" to be enabled
		And I wait on element "#cancelDeleteButton" to be visible
		When I click on the button "#cancelDeleteButton"
		Then I expect that a prompt is not opened		
		And I expect the url to contain the url for the question with ID "question1"
