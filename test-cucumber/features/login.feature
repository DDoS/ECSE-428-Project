# Gherkin Acceptance Tests for Login

<<<<<<< HEAD
Feature: Test Login
    Given I am an anonymous user
    And I want to log in to my user account
    When I click Login
    Then I should receive a Login form

Scenario: Check login empty username failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    And I press "Enter"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check login empty password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    And I press "Enter"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check login invalid password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    When I set "wrong" to the inputfield "#password"
    And I press "Enter"
=======
Feature: Logging Into an Account
    As a registered user
    In order to access my account and make use of its features
    I should be able to log into my account

Scenario: Successful Login with Username
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "kaichen" to the inputfield "#username"
    When I set "pokemon" to the inputfield "#password"
    And I click on the button ".btn.btn-primary"
    Then I expect that the title is "HOME - Mayhem"

Scenario: Login Attempt with Invalid Username
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    And I click on the button ".btn.btn-primary"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Login Attempt with Incorrect Password
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    When I set "wrong" to the inputfield "#password"
    And I click on the button ".btn.btn-primary"
    Then I expect that the title is "Login - Mayhem"
    And I expect that element ".alert.alert-danger" becomes visible

Scenario: Login Attempt with Empty Password
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    And I click on the button ".btn.btn-primary"
>>>>>>> d3f56dadf16f4d8ee257e16fa2319f3af2dfcbbc
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible


<<<<<<< HEAD
=======






>>>>>>> d3f56dadf16f4d8ee257e16fa2319f3af2dfcbbc
