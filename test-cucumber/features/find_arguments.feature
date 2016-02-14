# Gherkin Acceptance Test for Finding New Arguments

Feature: Finding New Arguments
	As an anonymous user or registered user
    In order to find the latest arguments posted to a question for a particular side without specifying a particular search query
    I should be able to view a list of all arguments, or a list of all arguments for a question, in order of chronological age
    
Scenario: Finding New Arguments For a Question
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View A Question - Mayhem"
	And I expect that element "#view_arguments_nonempty" becomes visible

Scenario: Finding New Arguments Against a Question
	Given I open the url "http://mayhem-ecse428.rhcloud.com/questions/view/?q=1"
	Then I expect that the title is "View A Question - Mayhem"
	And I expect that element "#view_arguments_nonempty" becomes visible
