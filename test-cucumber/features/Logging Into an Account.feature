Feature: Logging Into an Account
    As a registered user
    In order to access my account and make use of its features
    I should be able to log into my account

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"

    Scenario: [Normal] Successfully Logging In
        Given I open the site "/users/login"
        When I set "test_username" to the inputfield "#usernameInput"
        When I set "test_password" to the inputfield "#passwordInput"
        And I click on the button "#loginButton"
        Then I expect the url to contain "/questions/find"
        Then I expect that element ".alert.alert-success" contains the text "You are now logged in."

    Scenario: [Error] Attempting to Login with an Empty Username
        Given I open the site "/users/login"
        When I set "test_password" to the inputfield "#passwordInput"
        And I click on the button "#loginButton"
        Then I expect the url to contain "/users/login"
        Then I expect that element ".alert.alert-danger" contains the text "Username cannot be empty."

    Scenario: [Error] Attempting to Login with an Empty Password
        Given I open the site "/users/login"
        When I set "test_username" to the inputfield "#usernameInput"
        And I click on the button "#loginButton"
        Then I expect the url to contain "/users/login"
        Then I expect that element ".alert.alert-danger" contains the text "Password cannot be empty."

    Scenario: [Error] Attempting to Login with an Incorrect Username
        Given I open the site "/users/login"
        When I set "invalid" to the inputfield "#usernameInput"
        When I set "invalid" to the inputfield "#passwordInput"
        And I click on the button "#loginButton"
        Then I expect the url to contain "/users/login"
        Then I expect that element ".alert.alert-danger" contains the text "Incorrect username."

    Scenario: [Error] Attempting to Login with an Incorrect Password
        Given I open the site "/users/login"
        When I set "test_username" to the inputfield "#usernameInput"
        When I set "invalid" to the inputfield "#passwordInput"
        And I click on the button "#loginButton"
        Then I expect the url to contain "/users/login"
        Then I expect that element ".alert.alert-danger" contains the text "Incorrect password."
