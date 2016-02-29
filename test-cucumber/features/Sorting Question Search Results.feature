Feature: Sorting Question Search Results
    As an anonymous user or registered user
    In order to view questions that I will find most interesting based on a search query
    I should have the ability to filter the question search results and present them in a particular order

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question 1" and details "test details 1" and ID "question1"
        And I have upvoted the question with username "test_username" and ID "question1"
        And I have created a question with username "test_username" and question "test question 2" and details "test details 2" and ID "question2"
        And I have downvoted the question with username "test_username" and ID "question2"

    Scenario: [Normal] Obtaining Question Search Results Newest First
        Given I open the site "/questions/find"
        When I set "test details" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#newestFirstLi"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question2" first

    Scenario: [Alternate] Obtaining Question Search Results Oldest First
        Given I open the site "/questions/find"
        When I set "test details" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#oldestFirstLi"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question1" first

    Scenario: [Alternate] Obtaining Question Search Results Highest Score First
        Given I open the site "/questions/find"
        When I set "test details" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#highestScoreFirstLi"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question1" first

    Scenario: [Alternate] Obtaining Question Search Results Lowest Score First
        Given I open the site "/questions/find"
        When I set "test details" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#lowestScoreFirstLi"
        Then I expect the url to contain "/questions/find"
        Then I expect the page to contain the question with ID "question2" first
