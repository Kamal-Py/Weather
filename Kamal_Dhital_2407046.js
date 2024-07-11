// Student Name: Kamal Dhital
// University ID: 2407046

// Declaration and assigning the selector in the variable
const defaultCity = "Kathmandu"; // Default city
let mainBody = document.querySelector("#mainBody"); // Selecting the main body element
const weatherIcon = document.querySelector("#weatherIcon"); // Selecting the weather icon element
const temp = document.querySelector("#temperature"); // Selecting the temperature element
const weatherCondition = document.querySelector("#weatherCondition"); // Selecting the weather condition element
const city = document.querySelector("#city"); // Selecting the city element
const dateAndTime = document.querySelector("#dateAndTime"); // Selecting the date and time element
const itFeelsLike = document.querySelector("#itFeelsLike"); // Selecting the "feels like" temperature element
const weatherDescription = document.querySelector("#weatherDescription"); // Selecting the weather description element
const pressure = document.querySelector("#pressure"); // Selecting the pressure element
const windSpeed = document.querySelector("#windSpeed"); // Selecting the wind speed element
const humidity = document.querySelector("#humidity"); // Selecting the humidity element
const visibility = document.querySelector("#visibility"); // Selecting the visibility element
const tableBody = document.querySelector("#weatherTable tbody"); // Selecting the table body element
const searchBar = document.querySelector("#searchInput"); // Selecting the search input element
const searchButton = document.querySelector("#searchButton"); // Selecting the search button element


// Function to show loading overlay
function showLoadingOverlay() {
  document.querySelector("#loadingOverlay").style.display = "flex";
}

// Function to hide loading overlay
function hideLoadingOverlay() {
  document.querySelector("#loadingOverlay").style.display = "none";
}

// Function to save data to local storage
function saveToLocalStorage(city, data) {
  try {
    localStorage.setItem(
      city,
      JSON.stringify({
        data: data,
        date: new Date().toDateString(),
      })
    );
    return true;
  } catch {
    alert("Error while saving data into local storage");
  }
}

// Function to get data from local storage
function getFromLocalStorage(city) {
  storedData = JSON.parse(localStorage.getItem(city));
  return storedData;
}

async function fetchDataFromTheServer(city) {
  try {
    const response = await fetch(
      `https://kamaldhital2407046.000webhostapp.com/main.php?city=${city}&history=true`
    );

    if (!response.ok) {
      console.error("Server returned an error:", response.status);
      throw new Error(
        `Failed to fetch data. Server returned ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Invalid Array received from the server");
      alert("Invalid Array");
    }

    let responseData = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i].city) {
        responseData.push({
          name: data[i].city,
          country: data[i].country,
          feels_like: data[i].feels_like,
          iconid: data[i].iconid,
          visibility: data[i].visibility,
          temp: data[i].temp,
          humidity: data[i].humidity,
          pressure: data[i].pressure,
          description: data[i].description,
          weather_condition: data[i].weather_condition,
          weathericon: data[i].weathericon,
          windspeed: data[i].windspeed,
          dt: data[i].dt,
        });
      } else {
        responseData.push({
          dt: null,
          temp: null,
          description: "No Data Available",
          feels_like: null,
          pressure: null,
          windspeed: null,
          humidity: null,
          visibility: null,
        });
      }
    }

    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
}

// Function to get background image based on weather conditions
function getBackgroundImage(data) {
  if (data >= 200 && data < 300) {
    mainBody.style.backgroundImage = `url("https://images.unsplash.com/photo-1511289081-d06dda19034d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTd8fHxlbnwwfHx8fHw%3D")`; // Thunderstorm background
  } else if (data >= 300 && data < 400) {
    mainBody.style.backgroundImage = `url("https://wallpapercave.com/wp/Z0kmvgB.jpg")`; // Drizzle background
  } else if (data >= 500 && data < 600) {
    mainBody.style.backgroundImage = `url("https://th.bing.com/th/id/OIP.AVJXCd_GAKMrrk39l5OxTgHaEo?rs=1&pid=ImgDetMain")`; // Rain background
  } else if (data >= 600 && data < 700) {
    mainBody.style.backgroundImage = `url("https://c4.wallpaperflare.com/wallpaper/230/80/44/branches-winter-snow-5k-snowfall-wallpaper-preview.jpg")`; // Snow background
  } else if (data >= 700 && data < 800) {
    mainBody.style.backgroundImage = `url("https://live.staticflickr.com/6209/6087695435_4b545db144_b.jpg")`; // Atmosphere background
  } else if (data == 800) {
    mainBody.style.backgroundImage = `url("https://wallpapers.com/images/hd/bluish-orange-clear-sky-ckcbv6yqvjhcbi09.jpg")`; // Clear sky background
  } else if (data >= 801 && data < 810) {
    mainBody.style.backgroundImage = `url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTocgXUMba2p6YV_X2BQkJhxwkUyp4GRGS35Q&usqp=CAU")`; // Clouds background
  }
}

// Function to convert date and time
function convertDateAndTime(timestamp) {
  const newdateAndTime = new Date(timestamp * 1000).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
  return newdateAndTime;
}

// Function to update the weather table
function updateWeatherTable(data) {
  tableBody.innerHTML = ""; // Clear existing content

  for (let i = 1; i <= 7; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - i);

    const matchingData = data.find((item) => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === currentDate.toDateString();
    });

    const row = document.createElement("tr");
    if (
      matchingData &&
      typeof matchingData === "object" &&
      "dt" in matchingData
    ) {
      const formattedDate = convertDateAndTime(matchingData.dt);
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${matchingData.temp}°C</td>
        <td>${matchingData.description}</td>
        <td>${matchingData.feels_like}°C</td>
        <td>${matchingData.pressure}hPa</td>
        <td>${matchingData.windspeed}m/s</td>
        <td>${matchingData.humidity}%</td>
        <td>${matchingData.visibility}Km</td>
      `;
    } else {
      row.innerHTML = "<td colspan='8'>No History Available</td>";
    }

    tableBody.appendChild(row);
  }
}

function updateHTMLContent(data) {
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data[0].weathericon}@2x.png" alt="Icon of weather">`; // Updating weather icon
  temp.innerHTML = `${Math.round(data[0].temp)} °C`; // Updating temperature
  weatherCondition.innerHTML = `${data[0].weather_condition}`; // Updating weather condition
  city.innerHTML = `${data[0].name}, ${data[0].country}`; // Updating city and country
  itFeelsLike.innerHTML = `${data[0].feels_like} °C`; // Updating "feels like" temperature
  weatherDescription.innerHTML = `${data[0].description}`; // Updating weather description
  pressure.innerHTML = `${data[0].pressure} hPa`; // Updating pressure
  windSpeed.innerHTML = `${data[0].windspeed} m/s`; // Updating wind speed
  humidity.innerHTML = `${data[0].humidity} %`; // Updating humidity
  visibility.innerHTML = `${data[0].visibility} Km`; // Updating visibility

  getBackgroundImage(data[0].iconid); // Setting background image based on weather conditions

  dateAndTime.innerHTML = convertDateAndTime(data[0].dt); // Converting and updating date and time
  updateWeatherTable(data); // Updating the weather table
}

// Function to get current weather data
async function getCurrentWeatherData(city) {
  let localStorageData = getFromLocalStorage(city);

  if (localStorageData && localStorageData.date === new Date().toDateString()) {
    updateHTMLContent(localStorageData.data);
  } else {
    try {
      showLoadingOverlay();
      let newFetchData = await fetchDataFromTheServer(city);
      hideLoadingOverlay();

      if (newFetchData && newFetchData.error) {
        alert(`Error: ${newFetchData.error}`);
      } else if (newFetchData.length > 0) {
        saveToLocalStorage(city, newFetchData);
        let newLocalStorageData = getFromLocalStorage(city);
        updateHTMLContent(newLocalStorageData.data);
      } else {
        alert(`No data found for ${city}`);
      }
    } catch (error) {
      alert(`Error fetching data for ${city} !!!`);
      throw error;
    }
  }
}

// Event listener for search button click
searchButton.addEventListener("click", async (event) => {
  event.preventDefault();
  let searchCity = searchBar.value.trim();
  searchCity =
    searchCity.charAt(0).toUpperCase() + searchCity.slice(1).toLowerCase();
  if (searchCity) {
    await getCurrentWeatherData(searchCity);
  } else {
    alert("Please enter a valid city name:");
  }
});

// Initial fetch for default city
getCurrentWeatherData(defaultCity);
