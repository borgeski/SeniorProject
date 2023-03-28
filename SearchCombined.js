const container = document.getElementById('results');

async function handleSubmit(event) {
  event.preventDefault();
  const query = document.getElementById('search-movies').value;
  const results = await searchMovies(query);
  container.innerHTML = results.map(movie => `
    <div class="movie-item">
      <img src="${movie.posterUrl}" class="poster">
      <div class="movie-info">
        <div class="info-wrapper">
          <h2>${movie.title}</h2>
          <div class="movie-details">
            <div><span>Year:</span> ${movie.year}</div>
            <div><span>Genres:</span> ${movie.genres.join(', ')}</div>
            <div><span>Directors:</span> ${movie.directors.join(', ')}</div>
            <div><span>Actors:</span> ${movie.actors.join(', ')}</div>
            <div><span>Synopsis:</span> ${movie.synopsis}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

const form = document.getElementById('search-form');
form.addEventListener('submit', handleSubmit);

async function searchMovies(query) {
  const apiKey = '7f0e42ab052fbd09ee9ddc86b625600a';
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
  try {
    const response = await fetch(searchUrl);
    const searchResults = await response.json();
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