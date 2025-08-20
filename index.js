import { API_KEY } from './config.js'

function getCurrentPage() {
    const path = window.location.pathname.split('/').pop()
    return path || 'index.html'
}
// =================SHARED/UTILITY FUNCTIONS============================
const savingToLocalStorage = (obj) => {
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

function removeFromLocalStorage(title) {
    let storageBucket = retrieveFromLocalStorage()
    const filteredStorageBucket = storageBucket.filter(movie => movie.title !== title)
    localStorage.setItem("movies", JSON.stringify(filteredStorageBucket))
}

// =================INDEX PAGE FUNCTIONS============================
function initializeIndexPage() {
    const containerEl = document.getElementById('container')
    const formEl = document.getElementById('search-form')
    const searchBoxEl = document.getElementById('search-box')

    if (formEl && searchBoxEl && containerEl) {
        formEl.addEventListener('submit', (e) => {
            e.preventDefault()
            if (searchBoxEl.value) {
                searchMovie(searchBoxEl.value)
            }
            else {
                dataNotFound()
            }
        })
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('watchlist')) {
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
                console.log(retrieveFromLocalStorage())
                // alert(`${movieItem.title} saved to watchlist`)
            }
        })
    }

}

const searchMovie = (movie_name) => {
    const formatted_movie_name = movie_name.replaceAll(" ", "+")
    fetch(`https://www.omdbapi.com/?s=${formatted_movie_name}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                dataNotFound()
                searchBoxEl.value = ""
            }
            else {
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
        fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=${API_KEY}`)
            .then(response => response.json())
    );
    const movieDetails = await Promise.all(promises)
    return movieDetails
}

const renderMovies = async (movieDetails) => {
    const containerEl = document.getElementById('container')
    movieDetails.then(details => {
        const html = details.map((detail) => {
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
    const containerEl = document.getElementById('container')
    const html = `
    <p>Unable to find what you’re looking for. Please try another search.</p>
    `
    containerEl.classList.add('center-items')
    containerEl.innerHTML = html
}

// =================WATCHLIST PAGE FUNCTIONS============================

function initializeWatchlistPage() {
    const watchlistcontainerEl = document.getElementById('watchlist-container')
    console.log("Here")

    if (watchlistcontainerEl) {
        const storageBucket = retrieveFromLocalStorage()
        console.log(storageBucket)
        if (Number(storageBucket) !== 0) {
            renderWatchList(watchlistcontainerEl)
        } else {
            renderWatchListStartPage(watchlistcontainerEl)
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            const movieSection = e.target.closest('.movie')
            const title = movieSection.querySelector('.movie-title').textContent.split('⭐').shift()
            removeFromLocalStorage(title)
        }
        const storageBucket = retrieveFromLocalStorage()
        if (Number(storageBucket) !== 0) {
            renderWatchList(watchlistcontainerEl)
        } else {
            renderWatchListStartPage(watchlistcontainerEl)
        }
    })
}
function renderWatchListStartPage(watchlistcontainerEl) {
    const html = `
        <p class="watchlist-txt">Your watchlist is looking a little empty...</p>
        <a href="index.html" class="add-movie-redirect"><img src="images/add_circle.svg">Let's add some movies!</a>
        `
    watchlistcontainerEl.classList.add('center-items')
    watchlistcontainerEl.innerHTML = html
}
function renderWatchList(watchlistcontainerEl) {
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
                        <button class="remove"><img src="images/remove_circle.svg">Remove</button>
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
// =================MAIN INITIALIZATION============================
function initializePage() {
    const currentPage = getCurrentPage()

    switch (currentPage) {
        case 'index.html':
        case '':
            initializeIndexPage()
            break
        case 'watchlist.html':
            initializeWatchlistPage()
            break
    }
}

// =================PAGE LOAD EVENT============================
document.addEventListener('DOMContentLoaded', initializePage)
