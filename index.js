fetch('http://www.omdbapi.com/?s=Merlin&apikey=')
    .then(response => response.json())
    .then(data => console.log(data))