Feature: Logging out of an Account
  As a registered user
  In order to stop making use of my account's features
  I should be able to log out of my account

  Scenario: [Normal] Successfully Logging Out
    Given I open the site "/users/login"
    When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
    When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
    And I click on the button "#login"
    Then I expect the url to contain "/questions/find"
    Then I expect that element ".alert.alert-success" contains the text "You are now logged in."
    When I open the site "/users/logout"
    Then I expect that element "body" contains the partial text "Welcome"
