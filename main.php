<?php

// Name: Kamal Dhital
// University Student Number: 2407046

// Allow control access to another server
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Set content type to JSON
header("Content-Type: application/json");

// Include config.php file
include('config.php');

// Call function to connect to the local server
$connection = connectToLocalServer($serverName, $userName, $password);

// Extract data from the database and decode it
$allExtractingData = json_decode(extractDataFromDatabase($connection, $city), true);

// Check if extracting data is not empty
if (!empty($allExtractingData)) {
    
    // Check if history is requested
    if (isset($_GET["history"])) {
        // Take the latest data from the overall data and check its time
        $extractingData = $allExtractingData[0];
        $dataDate = isset($extractingData['dt']) ? date('Y-m-d', $extractingData['dt']) : '';
        $currentDate = date('Y-m-d');

        // Check if the latest data fetch time is greater than the refresh time
        if ($dataDate !== $currentDate) {
            $newFetchData = fetchInsertExtractData($connection, $city);
            echo json_encode($newFetchData);
        } else {
            echo json_encode($allExtractingData);
        }
    } else {
        // Execute this block if history is not passed by the user
        $extractingData = $allExtractingData[0];
        $dataDate = isset($extractingData['dt']) ? date('Y-m-d', $extractingData['dt']) : '';
        $currentDate = date('Y-m-d');
        if ($dataDate !== $currentDate) {
            $newFetchData = fetchInsertExtractData($connection, $city);
            $lastIndex = count($newFetchData) - 1;
            $lastData = $newFetchData[$lastIndex];
            echo json_encode($lastData);
        } else {
            // Echo the last index data if history is not passed by the user
            echo json_encode($extractingData);
        }
    }
} else {
    // Execute this block only when data is not available in the database
    $dataFromDatabase = fetchInsertExtractData($connection, $city);
    if ($dataFromDatabase) {
        echo json_encode($dataFromDatabase);
    } else {
        echo json_encode(["error" => "Failed to fetch data from the server."]);
    }
}
