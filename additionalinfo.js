const baseURL = "https://gateway.marvel.com/v1/public";
const privateKey = "92434db943c1f81cfc3bf78dedd57993e5ddd8c3";
const publicKey = "aab61ba02b4e29e79b2f6017812dd411";

const timestamp = Date.now().toString();
const hash = md5(timestamp + privateKey + publicKey);

// retrieving the query parameters from the current URL

const heroId = new URLSearchParams(window.location.search).get("id");
const heroDescription = new URLSearchParams(window.location.search).get("description");
const comicsURL = new URLSearchParams(window.location.search).get("comicsURL");
const seriesURL = new URLSearchParams(window.location.search).get("seriesURL");
const storiesURL = new URLSearchParams(window.location.search).get("storiesURL");

const detailsContainer = document.getElementById("details-container");

const heroURL = `${baseURL}/characters/${heroId}?apikey=${publicKey}&hash=${hash}&ts=${timestamp}`;
fetch(heroURL)
  .then(response => response.json())
  .then(data => {
    const hero = data.data.results[0];
    const name = document.createElement("h2");
    name.textContent = hero.name;
    detailsContainer.appendChild(name);
    const image = document.createElement("img");
    image.style.height="35vh"
    image.style.width='25vw'
    image.src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
    detailsContainer.appendChild(image);
    
    const header = document.createElement("h2");
    header.style.textAlign="start"
    header.style.textShadow="2px 2px 4px #e61111;"
      header.textContent = " Description:";
      detailsContainer.appendChild(header);
    
    const description = document.createElement("p");
    description.textContent = heroDescription || hero.description || "No description available.";
    detailsContainer.appendChild(description);
    const result = document.createElement("div");
    result.className = "result";
    result.style.display = "flex";
   
    if (comicsURL) {
      const comicsList = document.createElement("ul");
      comicsList.innerHTML = "<strong>Comics-List:</strong>";
      fetch(comicsURL)
        .then(response => response.json())
        .then(data => {
          const comics = data.data.results;
          comics.forEach(comic => {
            const comicListItem = document.createElement("li");
            comicListItem.textContent = comic.title;
            comicsList.appendChild(comicListItem);
          });
        })
        .catch(error => console.log(error));
        result.appendChild(comicsList);
    }

    if (seriesURL) {
      const seriesList = document.createElement("ul");
      seriesList.innerHTML = "<strong>Series-List:</strong>";
      fetch(seriesURL)
        .then(response => response.json())
        .then(data => {
          const series = data.data.results;
          series.forEach(serie => {
            const serieListItem = document.createElement("li");
            serieListItem.textContent = serie.title;
            seriesList.appendChild(serieListItem);
          });
        })
        .catch(error => console.log(error));
        result.appendChild(seriesList);
    }

    if (storiesURL) {
      const storiesList = document.createElement("ul");
      storiesList.innerHTML = "<strong>Stories-List:</strong>";
      fetch(storiesURL)
        .then(response => response.json())
        .then(data => {
          const stories = data.data.results;
          stories.forEach(story => {
            const storyListItem = document.createElement("li");
            storyListItem.textContent = story.title;
            storiesList.appendChild(storyListItem);
          });
        })
        .catch(error => console.log(error));
        result.appendChild(storiesList);
    }
    detailsContainer.appendChild(result);
  })
  .catch(error => console.log(error));