import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/moviePage.Module.css";
import imdbLogo from "/imbd_logo.png";
import rtLogo from "/rt.jpg";
import Modal from "../components/Modal/Modal.jsx";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../utils/localStorageFavoriteUtils";
import { supabase } from "../supabaseClient";

function getWeekDates() {
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [sessionsByDate, setSessionsByDate] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMovieAndSessions = async () => {
      try {
        // 1. Отримати дані фільму
        const { data: movieData, error: movieError } = await supabase
          .from("Movies")
          .select("*")
          .eq("id", id)
          .single();
        if (movieError) throw movieError;
        setMovie(movieData);

        // 2. Отримати сеанси для цього фільму з Supabase
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("movieid", id);
        if (sessionsError) throw sessionsError;

        // 3. Сгрупувати за датами тижня
        const week = getWeekDates();
        const grouped = week.map((date) => {
          const key = date.toISOString().split("T")[0];
          const times = sessions
            .filter((s) => s.date === key)
            .map((s) => s.time);
          return { date, times };
        });

        setSessionsByDate(grouped);
      } catch (error) {
        console.error("Помилка при отриманні даних:", error);
      }
    };

    fetchMovieAndSessions();
  }, [id]);

  useEffect(() => {
    const favorites = getFavoritesFromLocalStorage();
    setIsFavorite(favorites.includes(Number(id)));
  }, [id]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteFromLocalStorage(movie.id);
      setIsFavorite(false);
    } else {
      addFavoriteToLocalStorage(movie);
      setIsFavorite(true);
    }
  };

  const handleOrderClick = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from("sessions") // маленька літера
        .select("*")
        .eq("movieid", id); // нижній регістр

      if (error) throw error;

      if (sessions.length > 0) {
        setSelectedSession({
          poster: movie.poster,
          title: movie.title,
          hall: sessions[0].hall,
        });
      } else {
        console.warn("Сеансів не знайдено.");
      }
    } catch (error) {
      console.error("Помилка при отриманні сеансів:", error);
    }
  };

  if (!movie) return <div className="loading">Завантаження...</div>;

  const {
    poster,
    title,
    releaseDate,
    country,
    duration,
    ageRestriction,
    genres,
    ratings,
    description,
    trailerLink,
  } = movie;

  const ytId = new URL(trailerLink).searchParams.get("v");
  const nonEmpty = sessionsByDate.filter((g) => g.times.length > 0);

  const week = getWeekDates();
  const start = week[0];
  const end = week[week.length - 1];
  const fmt = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
  const rangeLabel = `${fmt(start)}-${fmt(end)}`;

  return (
    <div className="movie-page">
      <div className="movie-header">
        <img className="movie-poster" src={poster} alt={`${title} poster`} />
        <div className="movie-basic-info">
          <h1 className="movie-title">
            {title} ({new Date(releaseDate).getFullYear()})
          </h1>
          <p>
            <strong>Дата виходу:</strong> {releaseDate}
          </p>
          <p>
            <strong>Країна:</strong> {country}
          </p>
          <p>
            <strong>Тривалість:</strong> {duration}
          </p>
          <p>
            <strong>Вікові обмеження:</strong> {ageRestriction}
          </p>
          <p>
            <strong>Жанри:</strong> {genres.join(", ")}
          </p>
          <div className="ratings-inline">
            <div className="rating-inline-item">
              <img className="rating-logo" src={imdbLogo} alt="IMDb" />
              <span className="rating-value">{ratings.imdb}</span>
            </div>
            <div className="rating-inline-item">
              <img className="rating-logo" src={rtLogo} alt="RT" />
              <span className="rating-value">{ratings.rottenTomatoes}%</span>
            </div>
          </div>
        </div>
        <button className="favorite-button" onClick={toggleFavorite}>
          <img
            src={isFavorite ? "/icons/close.svg" : "/icons/heart_icon.svg"}
            alt={isFavorite ? "Видалити з обраного" : "Додати до обраного"}
          />
        </button>
      </div>

      <div className="movie-body">
        <aside className="sessions-sidebar">
          <h2>Сеанси цього тижня ({rangeLabel})</h2>
          <ul className="sessions-list">
            {nonEmpty.map(({ date, times }) => (
              <li key={date.toISOString()} className="session-item">
                <div className="session-day">
                  {date.toLocaleDateString("uk-UA", { weekday: "long" })}
                </div>
                <div className="session-times">
                  {times.map((t, i) => (
                    <span key={i}>{t}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <button className="book-button" onClick={handleOrderClick}>
            Замовити квиток
          </button>
        </aside>

        <div className="movie-details">
          <section className="movie-description">
            <h2>Про фільм:</h2>
            <p>{description}</p>
          </section>

          <section className="movie-trailer">
            <h2>Трейлер</h2>
            <div className="video-container">
              <iframe
                title={`${title} Trailer`}
                src={`https://www.youtube.com/embed/${ytId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      </div>

      {selectedSession && (
        <Modal
          isOpen
          onClose={() => setSelectedSession(null)}
          poster={selectedSession.poster}
          title={selectedSession.title}
          hall={selectedSession.hall}
        />
      )}
    </div>
  );
}
