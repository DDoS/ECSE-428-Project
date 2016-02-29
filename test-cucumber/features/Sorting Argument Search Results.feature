Feature: Sorting Argument Search Results
    As an anonymous user or registered user
    In order to view arguments that I will find most interesting based on a search query
    I should have the ability to filter the argument search results and present them in a particular order

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 1" and ID "argument1"
        And I have upvoted the argument with username "test_username" and question ID "question1" and ID "argument1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "test argument 2" and ID "argument2"
        And I have downvoted the argument with username "test_username" and question ID "question1" and ID "argument2"
        And I have created an argument against with username "test_username" and question ID "question1" and text "test argument 3" and ID "argument3"
        And I have upvoted the argument with username "test_username" and question ID "question1" and ID "argument3"
        And I have created an argument against with username "test_username" and question ID "question1" and text "test argument 4" and ID "argument4"
        And I have downvoted the argument with username "test_username" and question ID "question1" and ID "argument4"

    Scenario: [Normal] Obtaining Argument Search Results Newest First
        Given I open the site for the question with ID "question1"
        When I set "test argument" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#newestFirstLi"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument in favour with ID "argument2" first
        Then I expect the page to contain the argument against with ID "argument4" first

    Scenario: [Alternate] Obtaining Argument Search Results Oldest First
        Given I open the site for the question with ID "question1"
        When I set "test argument" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#oldestFirstLi"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument in favour with ID "argument1" first
        Then I expect the page to contain the argument against with ID "argument3" first

    Scenario: [Alternate] Obtaining Argument Search Results Highest Score First
        Given I open the site for the question with ID "question1"
        When I set "test argument" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#highestScoreFirstLi"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument in favour with ID "argument1" first
        Then I expect the page to contain the argument against with ID "argument3" first

    Scenario: [Alternate] Obtaining Argument Search Results Lowest Score First
        Given I open the site for the question with ID "question1"
        When I set "test argument" to the inputfield "#searchInput"
        And I click on the element "#sortButton"
        And I click on the element "#lowestScoreFirstLi"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument in favour with ID "argument2" first
        Then I expect the page to contain the argument against with ID "argument4" first
