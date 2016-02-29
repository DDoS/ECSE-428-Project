Feature: Search for an Argument
    As an anonymous user or registered user
    In order to find a particular argument or an argument that I will find interesting
    I should be able to search for that argument by viewing a list of all arguments with particular terms

    Background:
        Given the database has been cleared
        And I have a registered user account with username "test_username" and password "test_password" and email "test@example.com"
        And I have created a question with username "test_username" and question "test question" and details "test details" and ID "question1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "aaa bbb ccc" and ID "argument1"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "ddd eee fff" and ID "argument2"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "aaa bbb ccc ddd eee fff" and ID "argument3"
        And I have created an argument in favour with username "test_username" and question ID "question1" and text "bbb ggg" and ID "argument4"
        And I have created an argument against with username "test_username" and question ID "question1" and text "aaa bbb ccc" and ID "argument5"
        And I have created an argument against with username "test_username" and question ID "question1" and text "ddd eee fff" and ID "argument6"
        And I have created an argument against with username "test_username" and question ID "question1" and text "aaa bbb ccc ddd eee fff" and ID "argument7"
        And I have created an argument against with username "test_username" and question ID "question1" and text "bbb ggg" and ID "argument8"

    Scenario: [Normal] Obtaining Argument Search Results Using One Keyword
        Given I open the site for the question with ID "question1"
        When I set "aaa" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument with ID "argument1"
        Then I expect the page to not contain the argument with ID "argument2"
        Then I expect the page to contain the argument with ID "argument3"
        Then I expect the page to not contain the argument with ID "argument4"
        Then I expect the page to contain the argument with ID "argument5"
        Then I expect the page to not contain the argument with ID "argument6"
        Then I expect the page to contain the argument with ID "argument7"
        Then I expect the page to not contain the argument with ID "argument8"

    Scenario: [Alternate] Obtaining Argument Search Results Using Multiple Keywords
        Given I open the site for the question with ID "question1"
        When I set "aaa bbb ccc" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain the url for the question with ID "question1"
        Then I expect the page to contain the argument with ID "argument1"
        Then I expect the page to not contain the argument with ID "argument2"
        Then I expect the page to contain the argument with ID "argument3"
        Then I expect the page to contain the argument with ID "argument4"
        Then I expect the page to contain the argument with ID "argument5"
        Then I expect the page to not contain the argument with ID "argument6"
        Then I expect the page to contain the argument with ID "argument7"
        Then I expect the page to contain the argument with ID "argument8"

    Scenario: [Error] Attempting to Obtain Argument Search Results Using No Keywords
        Given I open the site for the question with ID "question1"
        And I click on the button "#searchButton"
        Then I expect the url to contain the url for the question with ID "question1"
        And I expect that element ".alert.alert-danger" contains the text "Search field is empty."
        Then I expect the page to not contain the argument with ID "argument1"
        Then I expect the page to not contain the argument with ID "argument2"
        Then I expect the page to not contain the argument with ID "argument3"
        Then I expect the page to not contain the argument with ID "argument4"
        Then I expect the page to not contain the argument with ID "argument5"
        Then I expect the page to not contain the argument with ID "argument6"
        Then I expect the page to not contain the argument with ID "argument7"
        Then I expect the page to not contain the argument with ID "argument8"

    Scenario: [Error] Attempting to Obtain Argument Search Results With Keywords that Yield No Matches
        Given I open the site for the question with ID "question1"
        When I set "hhh" to the inputfield "#searchInput"
        And I click on the button "#searchButton"
        Then I expect the url to contain the url for the question with ID "question1"
        And I expect that element "#noArgsForPara" contains the text "No results found."
        And I expect that element "#noArgsAgainstPara" contains the text "No results found."
        Then I expect the page to not contain the argument with ID "argument1"
        Then I expect the page to not contain the argument with ID "argument2"
        Then I expect the page to not contain the argument with ID "argument3"
        Then I expect the page to not contain the argument with ID "argument4"
        Then I expect the page to not contain the argument with ID "argument5"
        Then I expect the page to not contain the argument with ID "argument6"
        Then I expect the page to not contain the argument with ID "argument7"
        Then I expect the page to not contain the argument with ID "argument8"
