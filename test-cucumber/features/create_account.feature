# Gherkin Acceptance Tests for Create Account

Feature:

#Enter key to submit

Scenario: Check create account empty username failure using enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    And I press "Enter"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty email failure enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I press "Enter"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty password failure enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I press "Enter"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account non-matching password failure enter key
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "wrong" to the inputfield "#confirmPassword"
    And I press "Enter"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

#Button to submit

Scenario: Check create account empty username failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty email failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account empty password failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible

Scenario: Check create account non-matching password failure using button
    Given I open the url "http://mayhem-ecse428.rhcloud.com/users/create"
    When I set "test" to the inputfield "#username"
    And I set "kaichen.wang@mail.mcgill.ca" to the inputfield "#email"
    And I set "password" to the inputfield "#password"
    And I set "wrong" to the inputfield "#confirmPassword"
    And I click on the button ".btn.btn-success"
	Then I expect that the title is "Create Account - Mayhem"
	And I expect that element ".alert.alert-danger" becomes visible