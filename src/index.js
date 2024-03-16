// Import necessary modules and styles
import './style.css';
import {Notify} from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import {fetchCountries} from './fetchCountries';

// Set debounce delay
const DEBOUNCE_DELAY = 300;

// Select DOM elements
const searchBox = document.querySelector("#search-box");
const countryInfo = document.querySelector(".country-info");
const countryList = document.querySelector(".country-list");
const countryListContainer = document.querySelector(".country-list-container");

// Handle input in search box
function inputSearchBox() {
    const textInput = this.value.trim();    // Trim the input value to remove leading and trailing whitespace

    if (!textInput) {                       // If the search input is empty, clear and hide country information and list
        countryInfo.innerHTML = "";
        countryList.innerHTML = "";
        countryInfo.style.display = "none";
        return;
    };

    // Fetch countries based on the input text
    fetchCountries(textInput)
        .then(data => {
            const filteredData = data.filter(country => {           // Filter countries whose official names match the input text
                const regex = new RegExp(`\\b${textInput}`, 'i');   // Create a regular expression to match the input text, ignoring case and word boundaries
                return regex.test(country.name.official);           // Test if the official name of the country matches the regular expression
        });
            if (filteredData.length > 10) {                         // If there are too many matches, notify the user and return                                      
                Notify.info("Too many matches found. Please enter a more specific name.");
                return;
            }
            renderMarkup(filteredData); 
            adjustContainerHeight();    
        })
        .catch(error => {                                           // Clear and notify user if there's an error
            countryInfo.innerHTML = "";   
            countryList.innerHTML = "";
            Notify.failure("Oops..., there is no country with that name.");
        });
}

// Adjust the height of the container to fit the country list
function adjustContainerHeight() {
    const countryListHeight = countryList.offsetHeight;             // Get the height of the country list
    countryListContainer.style.height = `${countryListHeight}px`;   // Set the height of the container to match the height of the country list
}

// Render markup based on the fetched data
const renderMarkup = data => {
    data.sort((a, b) => a.name.official.localeCompare(b.name.official));  // Sort the data alphabetically by official country name

    if (data.length === 1) {                                        // If only one country, show country info
        countryList.innerHTML = "";
        const markupInfo = createInfoMarkup(data);
        countryInfo.innerHTML = markupInfo;
        countryInfo.style.display = "block"; 
    } else {                                                        // If multiple countries, show country list
        countryInfo.innerHTML = "";
        const markupList = createListMarkup(data);
        countryList.innerHTML = markupList;
        adjustContainerHeight();
        countryInfo.style.display = "none";
    }
};

 // Create markup for each country in the data array
const createListMarkup = data => {
    return data.map(({ name, flags }) =>
        `<li><img src="${flags.png}" alt="${name.official}" width="60" height="40">${name.official}</li>`
    ).join(" ");
};

// Create markup for country info
const createInfoMarkup = data => {
    return data.map(({ name, capital, population, flags, languages }) =>
        `<img src="${flags.png}" alt="${name.official}" width="100" height="50">
        <h1>${name.official}</h1>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${population.toLocaleString()}</p>
        <p><strong>Language:</strong> ${Object.values(languages)}</p>`
    ).join("");
}

// Add event listener to search box input with debounce
searchBox.addEventListener("input", debounce(inputSearchBox, DEBOUNCE_DELAY));

// Add event listener to window resize to adjust container height
window.addEventListener("resize", adjustContainerHeight);

// Hide country info initially
countryInfo.style.display = "none";