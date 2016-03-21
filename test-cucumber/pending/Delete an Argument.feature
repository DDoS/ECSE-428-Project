Feature: Deleting an Argument
  As a registered user
  In order to remove a particular argument I created
  I should be able to select the argument and then delete it

  Background:
    Given the database has been cleared
    And I have a registered user account with username "test_username2" and password "test_password2" and email "test2@example.com"
    And I am logged into the account with username "test_username2" and password "test_password2"
    And I have created a question with username "test_username2" and question "test question" and details "test details" and ID "question1"
    And I have created an argument in favour with username "test_username2" and question ID "question1" and text "test argument 1" and ID "argument1"

  Scenario: [Normal] Delete argument successfully
    Given I open the site for the question with ID "question1"
    And a prompt is not opened
    When I click on the element "#argumentDeleteButton"
    Then I wait on element ".deleteModal" to be enabled
    And I wait on element "#realArgumentDeleteButton" to be visible
    When I click on the button "#realArgumentDeleteButton"
    Then I expect that element ".alert.alert-success" contains the text "Argument deleted."
    And I expect the url to contain the url for the question with ID "question1"

  Scenario: [Error] Attempt to delete someone else's argument
    Given I open the site "/users/logout"
    And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
    And I am logged into the account with username "test_username" and password "test_password"
    And a prompt is not opened
    And I open the site for the question with ID "question1"
    When I click on the element "#argumentDeleteButton"
    Then I wait on element ".deleteModal" to be enabled
    Then I expect that element "#realArgumentDeleteButton" does not exist
