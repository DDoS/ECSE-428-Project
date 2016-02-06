# Gherkin Acceptance Tests for Create Argument

Feature: Test Create Argument
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

Scenario: Check create argument empty text failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/find"
	Then I expect that the title is "View Questions - Mayhem"
    And I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
 	And I click on the button ".btn.btn-default"
 	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible
	
Scenario: Check create argument successfully
    Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/find"
	Then I expect that the title is "View Questions - Mayhem"
    And I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
 	When I set "argument" to the inputfield "#create_argument"
 	And I click on the button ".btn.btn-default"
 	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element ".alert.alert-success" becomes visible
	
