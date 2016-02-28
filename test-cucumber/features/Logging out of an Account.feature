Feature: Logging Out of an Account
    As a registered user
    In order to ensure that the next user of this computer cannot access my account
    I should be able to log out of my account

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I am logged into the account with username "test_username" and password "test_password"

    Scenario: [Normal] Successfully Logging Out
        When I open the site "/users/logout"
        Then I expect that the title is "Home - Project Mayhem"
