<?php


// Name : Kamal Dhital
// University Student Number : 2407046


// * Defining servername, username and password for localhost connection
$serverName = "localhost";
$userName = "id21873875_weatherdatabase";
$password = "Weather-Data-1";


// Provide city as a query in URL to get the data according to the desired city (default: "Serampore")

$city = isset($_GET['city']) ? $_GET['city'] : "Kathmandu";

// Function to create database and table only if they do not exist
function createDatabaseAndTable($conn)
{
    try {
        // Create the database if it doesn't exist
        $conn->query("CREATE DATABASE IF NOT EXISTS id21873875_weather");
        $conn->select_db("id21873875_weather");

        // Create the table if it doesn't exist
        $conn->query("CREATE TABLE IF NOT EXISTS weatherrecords (
            dt INT,
            city VARCHAR(20),
            country VARCHAR(50),
            weathericon CHAR(50),
            iconid INT,
            temp DOUBLE,
            weather_condition VARCHAR(50),
            description VARCHAR(50),
            feels_like DOUBLE,
            pressure INT,
            windspeed DOUBLE,
            humidity INT,
            visibility INT
        )");

        // Return the connection if successful
        return $conn;
    } catch (Exception $err_mesg) {
        // Handle errors during database and table creation
        echo "Error while connecting to the database: " . $err_mesg;
        return false;
    }
}

// Function to connect with the local server
function connectToLocalServer($serverName, $userName, $password)
{
    try {
        // Establish a connection to the local server
        $connection = new mysqli($serverName, $userName, $password);

        // Check if the connection is successful
        if ($connection) {
            // Call the function to create database and table
            return createDatabaseAndTable($connection);
        } else {
            // Handle connection error
            echo "Error in establishing the connection.";
            return false;
        }
    } catch (Exception $err_mesg) {
        // Handle connection exception
        echo "Error in connecting to the server: " . $err_mesg;
        return false;
    }
}

// Function to fetch data from OpenMapWeather with a specified city parameter
function fetchDataFromAPI($city)
{
    try {
        // OpenWeatherMap API key
        $API_KEY = "1b7dd59820bd992941b5134e6aed93c8";

        // Construct the API URL
        $apiEndpoint = 'http://api.openweathermap.org/data/2.5/weather?q=' . $city . '&appid=' . $API_KEY . '&units=metric';

        // Fetch data from the API using file_get_contents
        $apiResponse = file_get_contents($apiEndpoint, true);

        // Decode the fetched data
        $decodedApiResponse = json_decode($apiResponse, true);

        // Return the decoded data if successful
        return $decodedApiResponse;
    } catch (Exception $err_mesg) {
        // Handle API data fetching error
        echo 'Error in fetching data from the API: ' . $err_mesg;
        return false;
    }
}

// Function to insert data into the database which is already fetched from OpenWeatherMap
function insertDataIntoDatabase($connection, $city, $data)
{
    try {
        // Extract relevant data from the fetched API data
        $dt = $data['dt'];
        $country = $data['sys']['country'];
        $weatherIcon = $data['weather'][0]['icon'];
        $iconId = $data['weather'][0]['id'];
        $temp = $data['main']['temp'];
        $weatherCondition = $data['weather'][0]['main'];
        $description = $data['weather'][0]['description'];
        $feelsLike = $data['main']['feels_like'];
        $pressure = $data['main']['pressure'];
        $windSpeed = $data['wind']['speed'];
        $humidity = $data['main']['humidity'];
        $visibility = $data['visibility'];

        // Insert data into the database
        $insertQueryResult = $connection->query("INSERT INTO weatherrecords(dt, city, country, weathericon, iconid, temp, weather_condition, description, feels_like, pressure, windspeed, humidity, visibility) VALUES (
            $dt, '$city', '$country', '$weatherIcon', $iconId, $temp, '$weatherCondition', '$description', $feelsLike, $pressure, $windSpeed, $humidity, $visibility)");

        // Return the query result
        return $insertQueryResult;
    } catch (Exception $err_mesg) {
        // Handle data insertion error
        echo 'Error while inserting data into the database: ' . $err_mesg;
        return false;
    }
}

// Function to extract data from the database and return the encoded data, taking connection and city parameters
function extractDataFromDatabase($connection, $city)
{
    try {
        // Select data from the database for the specified city, ordered by timestamp in descending order

        $sevenDaysAgo = date('Y-m-d H:i:s', strtotime('-8 days'));


        $selectQueryResult = $connection->query("SELECT * FROM weatherrecords WHERE city ='$city' AND dt >= UNIX_TIMESTAMP('$sevenDaysAgo') ORDER BY dt DESC");

        // Check if the query was successful
        if ($selectQueryResult) {
            // Fetch all selected data as an associative array
            $fetchSelectedData = $selectQueryResult->fetch_all(MYSQLI_ASSOC);

            // Encode the fetched data as JSON
            $encodedSelectedData = json_encode($fetchSelectedData);

            // Return the encoded data
            return $encodedSelectedData;
        } else {
            // Handle data extraction error
            return false;
        }
    } catch (Exception $err_mesg) {
        // Handle data extraction error
        echo 'Error in extracting data from the database: ' . $err_mesg;
        return false;
    }
}

// Function to fetch, insert, and extract data with connection and city parameters
function fetchInsertExtractData($connection, $city)
{
    try {
        // Fetch data from the OpenWeatherMap API
        $freshlyFetchedData = fetchDataFromAPI($city);

        // Check if data is fetched successfully
        if ($freshlyFetchedData) {
            // Insert the fetched data into the database
            $insertionResult = insertDataIntoDatabase($connection, $city, $freshlyFetchedData);

            // Check if data is inserted successfully
            if ($insertionResult) {
                // Extract data from the database
                $newExtractedData = extractDataFromDatabase($connection, $city);

                // Decode the extracted data
                $decodedData = json_decode($newExtractedData, true);

                // Check if data is extracted successfully
                if ($decodedData) {
                    // Return the extracted data
                    return $decodedData;
                } else {
                    // Handle data extraction error
                    return false;
                }
            } else {
                // Handle data insertion error
                echo json_encode(["error" => "Error on inserting data"]);
            }
        } else {
            // Handle data fetching error
            echo json_encode(["error" => "Error on fetching data"]);
        }
    } catch (Exception $err_mesg) {
        // Handle exception
        echo json_encode(["error" => "Error on fetchInsertExtractData", "details" => $err_mesg]);
    }
}
?>