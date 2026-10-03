import React from "react";

function MovieResult({ movie, onGoAgain }) {
  return (
    <section className="movie-result">
      <div className="brand">
        <div className="popcorn" aria-hidden="true">
          🍿
        </div>

        <h1>PopChoice</h1>
      </div>

      <div className="result-content">
        <h2>
          {movie.title}
          {movie.releaseYear ? ` (${movie.releaseYear})` : ""}
        </h2>

        <p>{movie.description}</p>

        <button className="go-button" type="button" onClick={onGoAgain}>
          Go Again
        </button>
      </div>
    </section>
  );
}

export default MovieResult;
