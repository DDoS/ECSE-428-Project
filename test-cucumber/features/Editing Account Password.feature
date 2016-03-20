Feature: Editing Account Password
	As a registered user
	In order to ensure the security of my account
	I should be able to change my account password

	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"

	Scenario: [Normal] Successfully Editing Password
		Given I open the site "/users/account"
		When I click on the button "#passwordEditButton"
		Then I expect that the attribute "readonly" from element "#passwordInput" does not exist
		And I expect that element "#confirmPasswordInput" becomes visible
		When I set "test_password_2" to the inputfield "#passwordInput"
		And I set "test_password_2" to the inputfield "#confirmPasswordInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-success" contains the text "Account information updated."

	Scenario: [Error] Attempting to Edit Password with Invalid Password
		Given I open the site "/users/account"
		When I click on the button "#passwordEditButton"
		Then I expect that the attribute "readonly" from element "#passwordInput" does not exist
		And I expect that element "#confirmPasswordInput" becomes visible
		When I set "aaa" to the inputfield "#passwordInput"
		And I set "aaa" to the inputfield "#confirmPasswordInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-danger" contains the text "Password must be at least 4 characters in length."

	Scenario: [Error] Attempting to Edit Password with Non-Matching Passwords
		Given I open the site "/users/account"
		When I click on the button "#passwordEditButton"
		Then I expect that the attribute "readonly" from element "#passwordInput" does not exist
		And I expect that element "#confirmPasswordInput" becomes visible
		When I set "test_password" to the inputfield "#passwordInput"
		And I set "test_password_2" to the inputfield "#confirmPasswordInput"
		And I click on the button "#updateButton"
		Then I expect the url to contain "/users/account"
		And I expect that element ".alert.alert-danger" contains the text "Passwords do not match."