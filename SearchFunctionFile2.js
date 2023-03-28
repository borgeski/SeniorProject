

// Function to return search results

// Makes an asynchronous function.
// Gives movie information from Movie Database API based on query. 
// Query comes from search box. 

async function searchMovies(query) {
// Set constant variables for API. 
// API key refers to our project
// searchURL is shortcut for URL from Movie Database
  const apiKey = '7f0e42ab052fbd09ee9ddc86b625600a';
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
 
  // Try & Catch are used to detect errors
  try {
     // Make request to TMDB API, but will wait.
    const response = await fetch(searchUrl);
     // SearchResults is the data from API that's in JSON format. 
    const searchResults = await response.json();
 /*
Movies variable waits for the searchResults.results
*/
    const movies = await Promise.all(searchResults.results.map(async ({ title, release_date: releaseDate, genre_ids: genreIds, id: movieId, poster_path: posterPath }) => {
      const posterUrl = `https://image.tmdb.org/t/p/w500/${posterPath}`;
      const genres = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => data.genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name));
      const { crew, cast } = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`)
        .then(response => response.json());
      const directors = crew.filter(person => person.department === 'Directing').slice(0, 3).map(director => director.name);
      const actors = cast.slice(0, 5).map(actor => actor.name);
      const synopsis = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
        .then(response => response.json())
        .then(data => data.overview);
      return { title, year: releaseDate ? releaseDate.substring(0, 4) : '', genres, directors, actors, synopsis, posterUrl };
    }));
    return movies;
  } catch (error) {
    console.error(error);
    return [];
  }
}