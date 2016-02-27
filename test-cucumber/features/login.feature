# Gherkin Acceptance Tests for Login

Feature: Logging Into an Account
    As a registered user
    In order to access my account and make use of its features
    I should be able to log into my account

Scenario: Successful Login with Username
    Given I open the site "/users/login"
    When I set "test" to the inputfield "#username"
    When I set "testpass123" to the inputfield "#password"
    And I click on the button ".btn.btn-primary"
    Then I expect that the title is "Home - Mayhem"

Scenario: Login Attempt with Invalid Username
    Given I open the site "/users/login"
    And I click on the button ".btn.btn-primary"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Login Attempt with Incorrect Password
    Given I open the site "/users/login"
    When I set "test" to the inputfield "#username"
    When I set "wrong" to the inputfield "#password"
    And I click on the button ".btn.btn-primary"
    Then I expect that the title is "Login - Mayhem"
    And I expect that element ".alert.alert-danger" becomes visible

Scenario: Login Attempt with Empty Password
    Given I open the site "/users/login"
    When I set "test" to the inputfield "#username"
    And I click on the button ".btn.btn-primary"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible
