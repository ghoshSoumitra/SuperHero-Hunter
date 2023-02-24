const publicKey = "aab61ba02b4e29e79b2f6017812dd411";
const privateKey = "92434db943c1f81cfc3bf78dedd57993e5ddd8c3";
const baseURL = "https://gateway.marvel.com/v1/public";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results-container");
const favoritesList = document.getElementById("favorites-list");
const favcont = document.getElementById("favorites-container");
const favbutton = document.getElementById("fav");

let favorites = [];



// autofilling part

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value;
  if (searchTerm.length >= 1) {
    autofill(searchTerm);
  }
});

function autofill(text) {
  searchInput.value = text;
  const dropdown = document.createElement('div');
  dropdown.setAttribute('id', 'suggestions');
  dropdown.style.position = 'absolute';
  dropdown.style.top = searchInput.offsetTop + searchInput.offsetHeight + 'px';
  dropdown.style.left = searchInput.offsetLeft + 'px';
  dropdown.style.width = '80vh'
  dropdown.style.backgroundColor = 'white';
  dropdown.style.border = '1px solid gray';
  dropdown.style.padding = '5px';
  dropdown.style.borderRadius = '10px';
  // dropdown.style.overflow='scroll'

  // Get the autocomplete suggestions
  const timestamp = Date.now().toString();
  const hash = md5(timestamp + privateKey + publicKey);

  const url = new URL(`${baseURL}/characters`);
  url.searchParams.append("nameStartsWith", text);
  url.searchParams.append("ts", timestamp);
  url.searchParams.append("apikey", publicKey);
  url.searchParams.append("hash", hash);

  fetch(url, { mode: "cors" })
    .then(response => response.json())
    .then(data => {
      const suggestions = data.data.results.map(result => result.name);
      suggestions.forEach((suggestion) => {
        const suggestionElem = document.createElement('div');
        suggestionElem.textContent = suggestion;
        suggestionElem.style.cursor = 'pointer';
        suggestionElem.style.height = '5vh'
        suggestionElem.style.backgroundColor = 'cyan'
        suggestionElem.style.margin = '1vh'
        suggestionElem.style.marginTop1 = '1vh';
        suggestionElem.style.fontWeight = "bold"
        suggestionElem.addEventListener('click', () => {
          searchInput.value = suggestion;
          dropdown.remove();
          searchSuperheroes(suggestion);
        });
        dropdown.appendChild(suggestionElem);
      });
    })
    .catch(error => console.log(error));

  // Add the dropdown to the page
  document.body.appendChild(dropdown);

  // Remove the dropdown when clicking outside of it 
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== searchInput) {
      dropdown.remove();
    }
  });
}

//  fetching the superheroes from the Marvel API and displays them in the results container

function searchSuperheroes(searchTerm) {
  const timestamp = Date.now().toString();
  const hash = md5(timestamp + privateKey + publicKey);

  const url = new URL(`${baseURL}/characters`);
  url.searchParams.append("nameStartsWith", searchTerm);
  url.searchParams.append("ts", timestamp);
  url.searchParams.append("apikey", publicKey);
  url.searchParams.append("hash", hash);

  fetch(url, { mode: "cors" })
    .then(response => response.json())
    .then(data => {
      console.log("searchSuperheroes function called");
      resultsContainer.style.backgroundColor = "#cccccccf";

      resultsContainer.innerHTML = "";

      data.data.results.forEach(hero => {
        const result = document.createElement("div");
        result.className = "result";

        const name = document.createElement("h3");
        name.textContent = hero.name;

        const image = document.createElement("img");
        image.src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
        image.addEventListener("click", () => {
          const heroURL = `${baseURL}/characters/${hero.id}?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;
          fetch(heroURL)
            .then(response => response.json())
            .then(data => {
              const heroDescription = data.data.results[0].description || "No description available.";
              const comicsURL = `${baseURL}/characters/${hero.id}/comics?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;
              const seriesURL = `${baseURL}/characters/${hero.id}/series?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;
              const storiesURL = `${baseURL}/characters/${hero.id}/stories?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;
              const queryParams = new URLSearchParams({
                description: heroDescription,
                comicsURL: comicsURL,
                seriesURL: seriesURL,
                storiesURL: storiesURL
              });
              window.location.href = `additionalinfo.html?id=${hero.id}&${queryParams.toString()}`;
            })
            .catch(error => console.log(error));
        });
        
        const favoriteButton = document.createElement("button");
        favoriteButton.textContent = "Add to favorites";
        favoriteButton.style.color = "#f3f3f3";
        favoriteButton.style.backgroundColor = "#966b08";
        favoriteButton.style.marginTop = "-1vh";
        favoriteButton.style.height = "3vh"
        favoriteButton.style.cursor = "pointer";
        favoriteButton.addEventListener("click", () => {
          addToFavorites(hero);
          saveFavorites(favorites);
        });

        result.appendChild(name);
        result.appendChild(image);
        result.appendChild(favoriteButton);
        resultsContainer.appendChild(result);
      });
    })
    .catch(error => console.log(error));
}



// Adds a superhero to the favorites list and displays it in the favorites container


function addToFavorites(hero) {
  if (hero.thumbnail) {
    // Check if hero is already in favorites
    let isDuplicate = false;
    for (let fav of favorites) {
      if (fav.id === hero.id) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) {
      alert("Hero is already in favorites!");
    } else {
      favorites.push(hero);
      saveFavorites();
      updateFavorites();
      displayadd();
    }
  } else {
    console.log("Hero does not have a thumbnail!");
  }
}




// Updates the favorites container with the current list of favorites

function updateFavorites() {
  const favoritesList = document.getElementById("favorites-list");
  favoritesList.innerHTML = "";
  favoritesList.style.display = "flex";
  favoritesList.style.flexWrap = "wrap"
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const timestamp = Date.now().toString();
  const hash = md5(timestamp + privateKey + publicKey);

  if (favorites.length > 0) {
    favorites.forEach((hero) => {
      const url = `${baseURL}/characters/${hero.id}?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;

      fetch(url, { mode: "cors" })
        .then(response => response.json())
        .then(data => {
          const heroDescription = data.data.results[0].description ? data.data.results[0].description : "No description available";
          const li = document.createElement("li");
          li.style.height = "70vh";
          li.style.width = "20vw";
          li.style.backgroundColor = "#ff9191";
          li.style.marginTop = "10vh"
          // li.style.display="flex"
          li.style.marginLeft = "5vw";
          li.style.borderRadius = "20px";
          li.style.boxShadow = "10px 10px 10px rgb(169 40 12)";
          li.style.overflow = "hidden";
          li.style.textOverflow = "ellipsis"
          let description = data.data.results[0].description;
          if (!description) {
            description = "No description available.";
          }
          li.innerHTML = `
            <div class="hero-info">
              <div class="hero-description">
                <h3>${data.data.results[0].name}</h3>
                <img src="${data.data.results[0].thumbnail && data.data.results[0].thumbnail.path
              ? data.data.results[0].thumbnail.path + "/portrait_medium." + data.data.results[0].thumbnail.extension
              : "https://via.placeholder.com/150?text=No+Image"
            }" alt="${data.data.results[0].name}"> 
            <p>${heroDescription}</p>
              </div>
            </div>
            <button class="remove" data-id="${data.data.results[0].id}">Remove</button>
          `;

          li.querySelector(".remove").addEventListener("click", () => {
            removeFavorite(data.data.results[0].id);
          });

          favoritesList.appendChild(li);
        })
        .catch(error => console.log(error));
    });
  } else {
    const message = document.createElement("p");
    message.textContent = "No favorites yet!";
    favoritesList.appendChild(message);
  }
}





// Removing a superhero from the favorites list and updates the favorites container


function removeFavorite(heroId) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((hero) => hero.id !== heroId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavorites();
  displayremove();
}








// Saving the favorites list to local storage
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Loads the favorites list from local storage,
function loadFavorites() {
  const favoritesJSON = localStorage.getItem("favorites");

  if (favoritesJSON !== null) {
    favorites = JSON.parse(favoritesJSON);
    updateFavorites();
  }

}


// for notifying the adding and removing of heroes
function displayadd() {
  const adding = document.getElementById("adding");

  adding.style.display = '';
  setTimeout(function () {
    adding.style.display = "none";
  }, 2000)
}
function displayremove() {
  const removing = document.getElementById("removing");
  removing.style.display = '';
  setTimeout(function () {
    removing.style.display = "none";
  }, 2000)
}

// Event listener for the search button
searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim();

  if (searchTerm !== "") {
    searchSuperheroes(searchTerm);
  }
});

// Load the favorites list when the show fav button is clicked
const hidebutton = document.getElementById("hide")
function displayfav() {
  favcont.style.display = '';
  loadFavorites();
  favbutton.style.display = "none"
  hidebutton.style.display = '';
}
function hidefav() {
  hidebutton.style.display = "none";
  favcont.style.display = "none";
  favbutton.style.display = ''
}
favbutton.addEventListener("click", displayfav);
hidebutton.addEventListener("click", hidefav);
