Feature: Editing a Question
    As a registered user
    In order to correct a mistake or add additional information to a question I created after posting it
    I should be able to edit the title and the details of that question
 
	Background:
		Given the database has been cleared
		And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
		And I am logged into the account with username "test_username" and password "test_password"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
		And I open the site for the question with ID "question1"

	Scenario: [Normal] Edit the title and details of the question successfully
        When I click on the element "#editButton"
        When I set "text1" to the inputfield "#questionInput"
        And I set "text2" to the inputfield "#detailsTextarea"
        And I click on the button "#submitButton"
        And I expect that element ".alert.alert-success" contains the text "Changes Saved."
        And I expect the url to contain the url for the question with ID "question1"


    Scenario: [Alternate] Edit only the title of the question successfully
        When I click on the element "#editButton"
		When I set "text1" to the inputfield "#questionInput"
        And I click on the button "#submitButton"
        Then I expect that element ".alert.alert-success" contains the text "Changes Saved."
        And I expect the url to contain the url for the question with ID "question1"
         
    Scenario: [Alternate] Edit only the details of the question successfully
        When I click on the element "#editButton"
        When I set "text2" to the inputfield "#detailsTextarea"
        And I click on the button "#submitButton"
        Then I expect that element ".alert.alert-success" contains the text "Changes Saved."
        And I expect the url to contain the url for the question with ID "question1"
         
    Scenario: [Error] Start to edit question but cancel
        When I click on the element "#editButton"
        When I set "text1" to the inputfield "#questionInput"
        And I set "text2" to the inputfield "#detailsTextarea"
        And I click on the button "#cancelButton"
        Then I expect the url to contain the url for the question with ID "question1"
        And I expect that element ".alert.alert-danger" contains the text "No changes made to question."

         
    Scenario: [Error] Edit a question and enter an empty title
        When I click on the element "#editButton"
        When I clear the inputfield "#questionInput"
        And I click on the button "#submitButton"
        Then I expect that element ".alert.alert-danger" contains the text "Title cannot be empty."
         
    Scenario: [Error] Edit a question and enter empty details
        When I click on the element "#editButton"
        When I clear the inputfield "#detailsTextarea"
        And I click on the button "#submitButton"
        Then I expect that element ".alert.alert-danger" contains the text "Details cannot be empty."
