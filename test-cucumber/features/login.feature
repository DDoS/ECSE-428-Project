# Gherkin Acceptance Tests for Login

Feature:

Scenario: Check login empty username failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    And I press "Enter"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check login empty password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    And I press "Enter"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check login invalid password failure
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/login"
    When I set "test" to the inputfield "#username"
    When I set "wrong" to the inputfield "#password"
    And I press "Enter"
	Then I expect that the title is "Login - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible


