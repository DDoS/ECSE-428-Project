Feature: Editing Account Email
	As a registered user
	In order to change my contact information
	I should be able to change the email address associated with my account

	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"

	Scenario: [Normal] Successfully Editing Email
		Given I open the site "/users/account"
		When I click on the button "#emailEditButton"
		Then I expect that the attribute "readonly" from element "#emailInput" does not exist
		When I set "test2@example.com" to the inputfield "#emailInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-success" contains the text "Account information updated."
		And I expect that inputfield "#emailInput" contains the text "test2@example.com"

	Scenario: [Alternate] Successfully Editing Email With No Changes
		Given I open the site "/users/account"
		When I click on the button "#emailEditButton"
		Then I expect that the attribute "readonly" from element "#emailInput" does not exist
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-success" contains the text "Account information updated."
		And I expect that inputfield "#emailInput" contains the text "test@example.com"

	Scenario: [Error] Attempting to Edit Email with Invalid Email Address
		Given I open the site "/users/account"
		When I click on the button "#emailEditButton"
		Then I expect that the attribute "readonly" from element "#emailInput" does not exist
		When I set "test@invalid" to the inputfield "#emailInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-danger" contains the text "Email is invalid."
		And I expect that inputfield "#emailInput" contains the text "test@example.com"

	Scenario: [Error] Attempting to Edit Email with No Email Address
		Given I open the site "/users/account"
		When I click on the button "#emailEditButton"
		Then I expect that the attribute "readonly" from element "#emailInput" does not exist
		When I clear the inputfield "#emailInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"