delete_argument.feature
# Gherkin Acceptance Test for Deleting Arguments

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username2" and password "test_password2" and email "test2@example.com"
        And I am logged into the account with username "test_username2" and password "test_password2"
        And I have created a question with username "test_username2" and question "test question" and details "test details" and ID "question1"
        And I have created an argument in favour with username "test_username2" and question ID "question1" and text "test argument 1" and ID "argument1"
        And I open the site "/users/logout"
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I am logged into the account with username "test_username" and password "test_password"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 2" and ID "argument2"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 3" and ID "argument3""test argument 2" and ID "argument2"

    Scenario: [Normal] Delete argument successfully
        Given I open the site for the question with ID "question1"
        And a prompt is not opened
        When I click on the element "#deleteButton" at argument with ID "argument2"
        Then I wait on element "#deleteModal" to be enabled
        And I wait on element "#realDeleteButton" to be visible
        When I click on the button "#realDeleteButton"
        Then I expect that element ".alert.alert-success" contains the text "Argument deleted."
        And I expect the url to contain the url for the question with ID "question1"

    Scenario: [Alternate] Cancel delete when asked for confirmation
        Given I open the site for the question with ID "question1"
        And a prompt is not opened
        When I click on the element "#deleteButton" at at argument with ID "argument3"
        Then I wait on element "#deleteModal" to be enabled
        And I wait on element "#cancelDeleteButton" to be visible
        When I click on the button "#cancelDeleteButton"
        Then I expect the url to contain the url for the question with ID "question1"		
        And I expect that a prompt is not opened

    Scenario: [Error] Attempt to edit someone else's argument
        Given I open the site for the question with ID "question1"
        And a prompt is not opened
        When I click on the element "#deleteButton" at at argument with ID "argument1"
        Then I wait on element "#deleteModal" to be enabled
        And I wait on element "#cancelDeleteButton" to be visible
        When I click on the button "#cancelDeleteButton"
        Then I expect the url to contain the url for the question with ID "question1"		
        And I expect that a prompt is not opened
