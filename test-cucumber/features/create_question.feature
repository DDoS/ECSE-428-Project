# Gherkin Acceptance Tests for Create Question

Feature: Test Create Question
	Given I am an registered user
	And I have logged in successfully
	And I want to create a question
	When I click Create New Question 
	Then I should be redirected to Create New Question Form
	
Background: 
	Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
	When I set "henry" to the inputfield "#username"
	When I set "1234" to the inputfield "#password"
	And I press "Enter"
	Then I expect that the title is "HOME - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible

Scenario: Check create question empty text failure enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/create"
	Then I expect that the title is "New Question - Mayhem"
	When I set "title" to the inputfield "#title"
    And I press "Enter"
	Then I expect that the title is "New Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible
	
Scenario: Check create question empty text failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/create"
	Then I expect that the title is "New Question - Mayhem"
 	When I set "title" to the inputfield "#title"
 	And I click on the button ".btn.btn-success"
 	Then I expect that the title is "New Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create question empty title failure using enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/create"
	Then I expect that the title is "New Question - Mayhem"
	When I set "text" to the inputfield "#text"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "New Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create question successfully
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/create"
    When I set "title" to the inputfield "#title"
	And I set "text" to the inputfield "#text"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "HOME - Mayhem"	
	And I expect that element ".alert.alert-success" becomes visible

	