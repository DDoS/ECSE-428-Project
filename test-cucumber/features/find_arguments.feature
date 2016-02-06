# Gherkin Acceptance Tests for Finding New Arguments

Feature: Test Finding New Arguments
	Given I am an anonymous user
	And I want to find new arguments
	When I click View Questions
	Then I should be redirected to View Questions Form
	And I click one question title
	And I shoud be redirected to View An Question Page
	
Scenario: Finding new arguments successfully
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element "#view_arguments_nonempty" becomes visible

