Feature: Finding New Questions
    As an anonymous user or registered user
    In order to find the latest questions posted to a question category without specifying a particular search query
    I should be able to view a list of all questions, or a list of all questions for a question category, in order of chronological age

Background:
    Given I open the site "/users/login"
    When I set "$DEFAULT_TEST_USERNAME" to the inputfield "#username"
    When I set "$DEFAULT_TEST_PASSWORD" to the inputfield "#password"
    And I click on the button "#login"

    Given I open the site "/questions/create"
    When I set "test_question_question" to the inputfield "#question"
    And I set "test_question_details" to the inputfield "#details"
    And I click on the button "#create"

Scenario: Finding All New Questions
    Given I open the site "/questions/find"
    Then I expect that element "body" contains the partial text "test_question_question"
    And I expect that element "body" contains the partial text "test_question_details"
