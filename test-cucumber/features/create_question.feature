# Gherkin Acceptance Test for Create a Question

Feature: Create a Question
	As a registered user
    In order to propose a topic for debate to the other users of the website
    I should be able to create a question	
    
Background: 
	Given I open the site "/users/login"
	When I set "test" to the inputfield "#username"
	When I set "testpass123" to the inputfield "#password"
	And I press "Enter"
	Then I expect that the title is "Home - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible
	
Scenario: Successfully Creating a Question with No Question Category
    Given I open the site "/questions/create"
    When I set "title" to the inputfield "#question"
	And I set "text" to the inputfield "#details"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Question: title - Mayhem"	
	And I expect that element ".alert.alert-success" becomes visible
	
Scenario: Attempting to Create Question with No Content
    Given I open the site "/questions/create"
	Then I expect that the title is "Create New Question - Mayhem"
 	When I set "title" to the inputfield "#question"
 	And I click on the button ".btn.btn-success"
 	Then I expect that the title is "Create New Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Attempting to Create Question with No Title
    Given I open the site "/questions/create"
	Then I expect that the title is "Create New Question - Mayhem"
	When I set "text" to the inputfield "#details"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create New Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible


	