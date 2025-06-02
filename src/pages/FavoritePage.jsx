import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFullFavorites,
  removeFavoriteFromLocalStorage,
} from "../utils/localStorageFavoriteUtils";
import styles from "../styles/Favored.module.css";

function FavoredPage() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    const favoriteMovies = await getFullFavorites();
    setMovies(favoriteMovies);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRemove = (id) => {
    removeFavoriteFromLocalStorage(id);
    setMovies((prev) => prev.filter((movie) => movie.id !== id));
  };

  return (
    <div className={styles.favoredPage}>
      <h2 className={styles.headerTitle}>Додано в обране:</h2>
      <div className={styles.moviesGrid}>
        {movies.length === 0 ? (
          <p>Фільми не додані до вибраного.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              {/* Кнопка видалення у верхньому правому куті */}
              <button
                className={styles.removeButton}
                onClick={() => handleRemove(movie.id)}
                title="Видалити з обраного"
              >
                <img src="/icons/close.svg" alt="Remove" />
              </button>

              {/* Клікабельний постер */}
              <Link to={`/movie/${movie.id}`}>
                <img
                  className={styles.posterLink}
                  src={movie.poster}
                  alt={movie.title}
                />
              </Link>

              <h3>
                <Link to={`/movie/${movie.id}`} className={styles.titleLink}>
                  {movie.title}
                </Link>
              </h3>

              <p>
                {movie.duration} | {movie.ageRestriction}+
              </p>
              <p>{movie.genres}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FavoredPage;
