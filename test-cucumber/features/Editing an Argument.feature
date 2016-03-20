edit_argument.feature
#Gherkin Acceptance Test for Editing Arguments

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
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 3" and ID "argument3"

    Scenario: [Normal] Change the text in argument
	Given I open the site for the question with ID "question1"
        When I click on the link "/arguments/edit?q=#"question1"&a=#"argument2""
	And I set "This is a test" to inputfield "argumentTextArea"
	And I click on the button "#submitButton"
	Then I expect that element ".alert.alert-success" contains the text "Argument edited."
        And I expect the url to contain the url for the question with ID "question1"

    Scenario: [Alternative] No change in argument
	Given I open the site for the question with ID "question1"
        When I click on the link "/arguments/edit?q=#"question1"&a=#"argument3""
	And I set "test argument 3" to inputfield "argumentTextArea"
	Then I expect that element ".alert.alert-success" contains the text "Argument edited."
        And I expect the url to contain the url for the question with ID "question1"

    Scenario: [Error] Start to edit argument but cancel
	Given I open the site for the question with ID "question1"
        When I click on the link "/arguments/edit?q=#"question1"&a=#"argument3""
        And I set "This is a test" to inputfield "argumentTextArea"
	And I click on the button "#cancelButton"
	Then I expect that element ".alert.alert-danger" contains the text No changes made to argument."
        And I expect the url to contain the url for the question with ID "question1"

    Scenario: [Error] Remove text in argument
	Given I open the site for the question with ID "question1"
        When I click on the link "/arguments/edit?q=#"question1"&a=#"argument3""
	And I click on the button "#submitButton"
	Then I expect that element ".alert.alert-danger" contains the text "new text is empty"
        And I expect the url to contain the url for the question with ID "question1"

    Scenario: [Error] Attempt to edit someone else's argument
	Given I open the site for the question with ID "question1"
        When I click on the link "/arguments/edit?q=#"question1"&a=#"argument1""
	When I set "This is a test" to inputfield "argumentInput"
	And I click on the button "#submitButton"
	Then I expect that element ".alert.alert-danger" contains the text "You cannot edit other people's arguments."
        And I expect the url to contain the url for the question with ID "question1"
