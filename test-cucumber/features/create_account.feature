# Gherkin Acceptance Tests for Create Account

<<<<<<< HEAD
Feature: Test Create Account
	Given I am an anonymous user
	And I want to create a user account
	When I click Create Account
	Then I should receive a Create Account form

Scenario: Check create account empty username failure using
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
=======
Feature: Creating an Account
    As an anonymous user
    In order to create and vote on questions, arguments, and question categories, as well as make use of the other benefits of account registration
    I should be able to create an account

# To test create new account, remove "@Pending"
@Pending
Scenario: Successfully Creating an Account
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "kaichen" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "password" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
    Then I expect that the title is "Login - Mayhem"

Scenario: Attempting to Create an Account with an Empty Email Address
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I click on the button ".btn.btn-success"
    Then I expect that the title is "Create Account - Mayhem"
    And I expect that element ".alert.alert-danger" becomes visible

Scenario: Attempting to Create an Account with an Invalid Email Address
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "not.an.email.ca" to the inputfield "#email"
    And I click on the button ".btn.btn-success"
    Then I expect that the title is "Create Account - Mayhem"

Scenario: Attempting to Create an Account with an Invalid Username
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
>>>>>>> d3f56dadf16f4d8ee257e16fa2319f3af2dfcbbc
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

<<<<<<< HEAD
# To test create new account:
# - change username
# - remove "@Pending"
@Pending
Scenario: Check create account successfully
=======
Scenario: Attempting to Create an Account with an Already Taken Username
>>>>>>> d3f56dadf16f4d8ee257e16fa2319f3af2dfcbbc
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "kaichen" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "password" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
<<<<<<< HEAD
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
=======
    Then I expect that the title is "Create Account - Mayhem"
    And I expect that element ".alert.alert-danger" becomes visible

Scenario: Attempting to Create an Account with a Invalid Password
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Attempting to Create an Account with Non-Matching Passwords
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "wrong" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

>>>>>>> d3f56dadf16f4d8ee257e16fa2319f3af2dfcbbc
