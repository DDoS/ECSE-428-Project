# Gherkin Acceptance Test for Create an Argument

Feature: Create an Argument
	Given I am an registered user
	And I have logged in successfully
	And I want to create a argument for question
	When I click on a question title in View Question
	Then I should be redirected to Create Argument Form
	
Background: 
	Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
	When I set "henry" to the inputfield "#username"
	When I set "1234" to the inputfield "#password"
	And I press "Enter"
	Then I expect that the title is "HOME - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible
	And I open the url "http://mayhem-ecse428.rhcloud.com/questions/find"
	Then I expect that the title is "View Questions - Mayhem"
	
Scenario: Successfully Creating an Argument In Favour of a Question
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
 	When I set "agree argument" to the inputfield "#create_argument"
 	And I click on the button "#pro"
 	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible

Scenario: Successfully Creating an Argument Against a Question
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
 	When I set "disagree argument" to the inputfield "#create_argument"
 	And I click on the button "#con"
 	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible

Scenario: Attempting to Create Argument with No Content
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
 	And I click on the button "#pro"
 	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

	
