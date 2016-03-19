Feature: Delete an Account
	As a registered user
	In order to rid myself of endless online debates
	I should be able to delete my account in its entirety

	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"

	Scenario: [Normal] Successful account deletion
		Given I open the site "/users/account"
		And a prompt is not opened
		When I click on the element "#deleteButton"
		Then I wait on element "#deleteModal" to be enabled
		And I wait on element "#realDeleteButton" to be visible
		When I click on the button "#realDeleteButton"
		Then I expect the url to contain "/"
		And I expect that the title is "Home - Project Mayhem"

	Scenario: [Alternate] Cancel delete when asked for confirmation
		Given I open the site "/users/account"
		And a prompt is not opened
		When I click on the element "#deleteButton"
		Then I wait on element "#deleteModal" to be enabled
		And I wait on element "#cancelDeleteButton" to be visible
		When I click on the button "#cancelDeleteButton"
		Then I expect that a prompt is not opened
		And I expect that the title is "Manage Account - Project Mayhem"