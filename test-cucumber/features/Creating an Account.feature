Feature: Creating an Account
    As an anonymous user
    In order to create and vote on questions and arguments, as well as make use of the other benefits of account registration
    I should be able to create an account

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"

    Scenario: [Normal] Successfully Creating an Account
        Given I open the site "/users/create"
        When I set "test_username2" to the inputfield "#usernameInput"
        And I set "test@example.com" to the inputfield "#emailInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/login"
        Then I expect that element ".alert.alert-success" contains the text "Account successfully created."

    Scenario: [Error] Attempting to Create an Account with an Empty Email Address
        Given I open the site "/users/create"
        When I set "test_username2" to the inputfield "#usernameInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"

    Scenario: [Error] Attempting to Create an Account with an Invalid Email Address
        Given I open the site "/users/create"
        When I set "test_username2" to the inputfield "#usernameInput"
        And I set "test@invalid" to the inputfield "#emailInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Email is invalid."

    Scenario: [Error] Attempting to Create an Account with an Empty Username
        Given I open the site "/users/create"
        And I set "test@example.com" to the inputfield "#emailInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Username is empty."

    Scenario: [Error] Attempting to Create an Account with an Already Taken Username
        Given I open the site "/users/create"
        When I set "test_username" to the inputfield "#usernameInput"
        And I set "test@example.com" to the inputfield "#emailInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Account with that username already exists."

    Scenario: [Error] Attempting to Create an Account with an Invalid Password
        Given I open the site "/users/create"
        When I set "test_username" to the inputfield "#usernameInput"
        And I set "test_email@example.com" to the inputfield "#emailInput"
        And I set "t" to the inputfield "#passwordInput"
        And I set "t" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Password must be at least 4 characters in length."

    Scenario: [Error] Attempting to Create an Account with an Empty Password
        Given I open the site "/users/create"
        When I set "test_username" to the inputfield "#usernameInput"
        And I set "test_email@example.com" to the inputfield "#emailInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Password must be at least 4 characters in length."

    Scenario: [Error] Attempting to Create an Account with Non-Matching Passwords
        Given I open the site "/users/create"
        When I set "test_username" to the inputfield "#usernameInput"
        And I set "test_email@example.com" to the inputfield "#emailInput"
        And I set "test_password" to the inputfield "#passwordInput"
        And I set "test_password2" to the inputfield "#confirmPasswordInput"
        And I click on the button "#createButton"
        Then I expect the url to contain "/users/create"
        Then I expect that element ".alert.alert-danger" contains the text "Passwords do not match."
