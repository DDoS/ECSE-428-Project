Feature: Creating an Account
    As an anonymous user
    In order to create and vote on questions and arguments, as well as make use of the other benefits of account registration
    I should be able to create an account

Scenario: [Normal] Successfully Creating an Account
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_email@example.com" to the inputfield "#email"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/login"
    Then I expect that element ".alert.alert-success" contains the text "Account successfully created."

Scenario: [Error] Attempting to Create an Account with an Empty Email Address
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    # No flash due to client side validation

Scenario: [Error] Attempting to Create an Account with an Invalid Email Address
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_email@invalid" to the inputfield "#email"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Email is invalid."

Scenario: [Error] Attempting to Create an Account with an Empty Username
    Given I open the site "/users/create"
    And I set "test_email@example.com" to the inputfield "#email"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Username is empty."

Scenario: [Error] Attempting to Create an Account with an Already Taken Username
    Given I open the site "/users/create"
    When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
    And I set "test_email@example.com" to the inputfield "#email"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Account with that username already exists."

Scenario: [Error] Attempting to Create an Account with an Invalid Password
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_email@example.com" to the inputfield "#email"
    And I set "t" to the inputfield "#password"
    And I set "t" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Password must be at least 4 characters in length."

Scenario: [Error] Attempting to Create an Account with an Empty Password
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_email@example.com" to the inputfield "#email"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Password must be at least 4 characters in length."

Scenario: [Error] Attempting to Create an Account with Non-Matching Passwords
    Given I open the site "/users/create"
    When I set "test_username" to the inputfield "#username"
    And I set "test_email@example.com" to the inputfield "#email"
    And I set "test_password" to the inputfield "#password"
    And I set "test_password2" to the inputfield "#confirmPassword"
    And I click on the button "#create"
    Then I expect the url to contain "/users/create"
    Then I expect that element ".alert.alert-danger" contains the text "Passwords do not match."
