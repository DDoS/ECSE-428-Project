# Gherkin Acceptance Test for Finding New Arguments

Feature: Finding New Arguments
	Given I am an anonymous or registered user
	And I want to find new arguments
	When I click View Questions
	Then I should be redirected to View Questions Form
	And I click one question title
	And I should be redirected to View An Question Page
	
Scenario: Finding New Arguments For a Question
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element "#view_arguments_nonempty" becomes visible

Scenario: Finding New Arguments Against a Question
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View An Question - Mayhem"
	And I expect that element "#view_arguments_nonempty" becomes visible
