# Gherkin Acceptance Tests for Create Account

Feature: Test Create Account
	Given I am an anonymous user
	And I want to create a user account
	When I click Create Account
	Then I should receive a Create Account form

Scenario: Check create account empty username failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty email failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account non-matching password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "wrong" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

# To test create new account:
# - change username
# - remove "@Pending"
@Pending
Scenario: Check create account successfully
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "kaichen" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "password" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Login - Mayhem"

Scenario: Check create duplicate account failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "kaichen" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "password" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible