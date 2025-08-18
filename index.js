import { API_KEY } from './config.js'
fetch(`http://www.omdbapi.com/?s=Merlin&apikey=${API_KEY}`)
    .then(response => response.json())
    .then(data => console.log(data))