# Gherkin Acceptance Test for Finding New Questions

Feature: Finding New Questions
	Given I am an anonymous or registered user	
	And I want to find new questions
	When I click View Questions
	Then I should be redirected to View Questions Form
		
Scenario: Finding All New Questions
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/find"
	Then I expect that the title is "View Questions - Mayhem"
