# Gherkin Acceptance Test for Create an Argument

Feature: Create an Argument
	As a registered user
    In order to contribute to the debate associated with a question and take a position
    I should be able to create an argument
	
Background: 
	Given I open the site "/users/login"
	When I set "test" to the inputfield "#username"
	When I set "testpass123" to the inputfield "#password"
	And I press "Enter"
	Then I expect that the title is "Home - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible
	And I open the site "/questions/find"
	Then I expect that the title is "All Questions - Mayhem"
	Given I open the site "/questions/create"
    When I set "title" to the inputfield "#question"
	And I set "text" to the inputfield "#details"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Question: title - Mayhem"	
	And I expect that element ".alert.alert-success" becomes visible
	
Scenario: Successfully Creating an Argument In Favour of a Question
    Given I open the site "/questions/view/?q=1"
	Then I expect that the title is "Question: title - Mayhem"
 	When I set "agree argument" to the inputfield ".form-control"
 	And I click on the button "#pro"
 	Then I expect that the title is "Question: title - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible

Scenario: Successfully Creating an Argument Against a Question
    Given I open the site "/questions/view/?q=1"
	Then I expect that the title is "Question: title - Mayhem"
 	When I set "disagree argument" to the inputfield ".form-control"
 	And I click on the button "#con"
 	Then I expect that the title is "Question: title - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible

Scenario: Attempting to Create Argument with No Content
    Given I open the site "/questions/view/?q=1"
	Then I expect that the title is "Question: title - Mayhem"
 	And I click on the button "#pro"
 	Then I expect that the title is "Question: title - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

	
