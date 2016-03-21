Feature: Editing an Argument
  As a registered user
  In order to change a particular argument I had entered
  I should be able to select the argument and edit it

  Background:
    Given the database has been cleared
    And I have a registered user account with username "test_username2" and password "test_password2" and email "test2@example.com"
    And I am logged into the account with username "test_username2" and password "test_password2"
    And I have created a question with username "test_username2" and question "test question" and details "test details" and ID "question1"
    And I have created an argument in favour with username "test_username2" and question ID "question1" and text "test argument 1" and ID "argument1"

  Scenario: [Normal] Change the text in argument
    Given I open the site for the question with ID "question1"
    And a prompt is not opened
    When I click on the element ".argumentEditButton"
    And I add "edited" to the inputfield "#argumentTextarea"
    And I click on the button "#submitButton"
    Then I expect the url to contain the url for the question with ID "question1"
    And I expect that element ".vote-panel-text-paragraph" contains the text "test argument 1edited"

#  Scenario: [Alternate] Remove text in argument
#    Given I open the site for the question with ID "question1"
#    And a prompt is not opened
#    When I click on the element ".argumentEditButton"
#    And I clear the inputfield "#argumentTextarea"
#    And I click on the button "#submitButton"
#    Then I expect the url to contain the url for the question with ID "question1"
#    And I expect that element ".vote-panel-text-paragraph" does not contain any text
#
#  Scenario: [Alternate] No change in argument
#    Given I open the site for the question with ID "question1"
#    And a prompt is not opened
#    When I click on the element ".argumentEditButton"
#    And I click on the button "#submitButton"
#    Then I expect the url to contain the url for the question with ID "question1"
#    And I expect that element ".vote-panel-text-paragraph" contains the text "test argument 1"
#
#  Scenario: [Alternate] No change in argument
#    Given I open the site "/users/logout"
#    And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
#    And I am logged into the account with username "test_username" and password "test_password"
#    And a prompt is not opened
#    And I open the site for the question with ID "question1"
#    When I click on the element ".argumentEditButton"
#    Then I expect that element "#submitButton" is not enabled
#    And I expect that element "#argumentTextarea" is not enabled