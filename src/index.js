import './style.css';
import {Notify} from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import {fetchCountries} from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const refs = {
    searchBox: document.querySelector("#search-box"),
    countryInfo: document.querySelector(".country-info"),
    countryList: document.querySelector(".country-list"),
    countryListContainer: document.querySelector(".country-list-container"),
};

const clearMarkup = ref => (ref.innerHTML = " ");

function inputSearchBox() {
    const textInput = this.value.trim();

    if(!textInput) {
        clearMarkup(refs.countryInfo);
        clearMarkup(refs.countryList);
        refs.countryInfo.style.display = "none"
        return;
    }

    fetchCountries(textInput)
        .then(data => {
        if(data.length > 10) {
            Notify.info("Too many matches found. Please enter a more specific name.");
            return;
        }
        renderMarkup(data);
        adjustContainerHeight()
    })
    .catch(error => {
        clearMarkup(refs.countryInfo);
        clearMarkup(refs.countryList);
        Notify.failure("Oops..., there is no country with that name.")
    });
}

function adjustContainerHeight() {
    const countryListHeight = refs.countryList.offsetHeight;
    refs.countryListContainer.style.height = `${countryListHeight}px`; 
}

const renderMarkup = data => {
    data.sort((a, b) => a.name.official.localeCompare(b.name.official));

    if (data.length === 1) {
        clearMarkup(refs.countryList);
        const markupInfo = createInfoMarkup(data);
        refs.countryInfo.innerHTML = markupInfo;
        refs.countryInfo.style.display = "block"; 
    } else {
        clearMarkup(refs.countryInfo);
        const markupList = createListMarkup(data);
        refs.countryList.innerHTML = markupList;
        adjustContainerHeight();
        refs.countryInfo.style.display = "none"
    }
};

const createListMarkup = data => {
    return data
        .map(
            ({name, flags}) =>
        `<li><img src="${flags.png}" alt="${name.official}" width="60" height="40">${name.official}</li>`
        )
        .join(" ");
};

const createInfoMarkup = data => {
    return data
    .map(
        ({name, capital, population, flags, languages}) =>
        `<img src="${flags.png}" alt="${name.official}" width="100" height="50">
        <h1>${name.official}</h1>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${population.toLocaleString()}</p>
        <p><strong>Language:</strong> ${Object.values(languages)}</p>`
    );
}

refs.searchBox.addEventListener("input", debounce(inputSearchBox, DEBOUNCE_DELAY));

window.addEventListener("resize", adjustContainerHeight);

refs.countryInfo.style.display = "none";