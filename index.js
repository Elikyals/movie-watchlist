import { API_KEY } from './config.js'

const containerEl = document.getElementById('container')
const formEl = document.getElementById('search-form')
const searchBoxEl = document.getElementById('search-box')
const watchlistcontainerEl = document.getElementById('watchlist-container')

renderWatchList()

formEl.addEventListener('submit', (e) => {
    e.preventDefault()
    if (searchBoxEl.value){
        searchMovie(searchBoxEl.value)
    }
    else {
        dataNotFound()
    }
})


const searchMovie = (movie_name) => {
    const formatted_movie_name = movie_name.replaceAll(" ", "+")
    fetch(`http://www.omdbapi.com/?s=${formatted_movie_name}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False'){
                dataNotFound()
                searchBoxEl.value = ""
            }
            else{
                const movieListID = data.Search.map((movieItem) => {
                    return movieItem.imdbID
                })
                const uniquemovieListID = movieListID.filter((value, index, array) => 
                    array.indexOf(value) === index)
                const movieDetails = getMovieDetails(uniquemovieListID)
                renderMovies(movieDetails)
            }
        })

}
const getMovieDetails = async (arrMovieListID) => {
    const promises = arrMovieListID.map(movieID =>
        fetch(`http://www.omdbapi.com/?i=${movieID}&apikey=${API_KEY}`)
            .then(response => response.json())
    );
    const movieDetails = await Promise.all(promises)
    return movieDetails
}

const renderMovies = async (movieDetails) => {
    movieDetails.then(details => {
            const html = details.map((detail) =>{
                    return `
                    <div class="movie">
                        <img class="movie-cover" src="${detail.Poster}" alt="${detail.Title} Cover">
                        <div class="movie-details">
                            <h3 class="movie-title">${detail.Title}<span class="movie-ratings">⭐  ${detail.imdbRating}</span></h3>
                            <div class="movie-meta">
                                <p class="runtime">${detail.Runtime}</p>
                                <p class="genre">${detail.Genre}</p>
                                <button class="watchlist"><img src="images/add_circle.svg">Watchlist</button>
                            </div>
                            <p class="movie-description">${detail.Plot}</p>
                        </div>
                    </div>
                    <hr>
                    `
                }).join('')
            containerEl.classList.remove('center-items')
            containerEl.innerHTML = html    
            })
}

const dataNotFound = () => {
    const html = `
    <p>Unable to find what you’re looking for. Please try another search.</p>
    `
    containerEl.classList.add('center-items')
    containerEl.innerHTML = html
}

// WatchList
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('watchlist')){
        const movieSection = e.target.closest('.movie')
        const movieItem = {
            poster: movieSection.querySelector('.movie-cover').src,
            title: movieSection.querySelector('.movie-title').textContent.split('⭐').shift(),
            imdbRating: movieSection.querySelector('.movie-ratings').textContent.split('⭐').pop(),
            runtime: movieSection.querySelector('.runtime').textContent,
            genre: movieSection.querySelector('.genre').textContent,
            plot: movieSection.querySelector('.movie-description').textContent
        }
        savingToLocalStorage(movieItem)
    }
})

const savingToLocalStorage = (obj)  => {
    let storageBucket = retrieveFromLocalStorage()
    if (storageBucket === null) {
        storageBucket = []
    }
    storageBucket.push(obj)
    localStorage.setItem("movies", JSON.stringify(storageBucket))

}

function retrieveFromLocalStorage() {
    const bucket = JSON.parse(localStorage.getItem('movies'))
    return bucket
}

function renderWatchList() {
    const bucket = retrieveFromLocalStorage()
    if (bucket !== null) {
        const html = bucket.map((movie) => {
            return `
            <div class="movie">
                <img class="movie-cover" src="${movie.poster}" alt="${movie.title} Cover">
                <div class="movie-details">
                    <h3 class="movie-title">${movie.title}<span class="movie-ratings">⭐${movie.imdbRating}</span></h3>
                    <div class="movie-meta">
                        <p class="runtime">${movie.runtime}</p>
                        <p class="genre">${movie.genre}</p>
                        <button><img src="images/remove_circle.svg">Remove</button>
                    </div>
                    <p class="movie-description">${movie.plot}</p>
                </div>
            </div>
            <hr>
            `
        }).join("")
        watchlistcontainerEl.classList.remove('center-items')
        watchlistcontainerEl.innerHTML = html
    }
}

