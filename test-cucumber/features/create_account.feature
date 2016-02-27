# Gherkin Acceptance Tests for Create Account

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
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Attempting to Create an Account with an Already Taken Username
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "kaichen" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "password" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
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
