# Gherkin Acceptance Test for Finding New Arguments

Feature: Finding New Arguments
	As an anonymous user or registered user
    In order to find the latest arguments posted to a question for a particular side without specifying a particular search query
    I should be able to view a list of all arguments, or a list of all arguments for a question, in order of chronological age

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
    
Scenario: Finding New Arguments For a Question
	Given I open the site "/questions/view/?q=1"
	Then I expect that the title is "Question: title - Mayhem"
	And I expect that element "#argContainer" becomes visible

Scenario: Finding New Arguments Against a Question
	Given I open the site "/questions/view/?q=1"
	Then I expect that the title is "Question: title - Mayhem"
	And I expect that element "#argContainer" becomes visible
