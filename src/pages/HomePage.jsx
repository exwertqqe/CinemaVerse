import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { supabase } from "../supabaseClient";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      let { data: Movies, error } = await supabase.from("Movies").select("*");
      if (error) {
        console.error(error);
      } else {
        setMovies(Movies);
      }
    };
    fetchMovies();
  }, []);

  // Функція для попереднього слайду
  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? 2 : prevIndex - 1));
  };

  // Функція для наступного слайду
  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 2 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 10000); // 10 секунди зміна слайдера

    // Очищення інтервалу при виході з компонента
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>ЗАРАЗ У ПРОКАТІ</h1>
        </header>

        <div className={styles.sliderWrapper}>
          <div
            className={styles.sliderTrack}
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            <div className={styles.slide}>
              <img
                src="img/posters/image 1.jpg"
                alt="MISSION IMPOSSIBLE"
                className={styles.slideImage}
              />
              <h2 className={styles.slideTitle}>
                МІСІЯ НЕЗДІЙСНЕННА: ФІНАЛЬНА РОЗПЛАТА НЕЗАБАРОМ У КІНО
              </h2>
            </div>
            <div className={styles.slide}>
              <img
                src="img/posters/image2.png"
                alt="LILO AND STITCH"
                className={styles.slideImage}
              />
              <h2 className={styles.slideTitle}>ЛІЛО ТА СТІЧ СКОРО В КІНО</h2>
            </div>
            <div className={styles.slide}>
              <img
                src="img/posters/image3.png"
                alt="HOW TO TRAIN YOUR DRAGON"
                className={styles.slideImage}
              />
              <h2 className={styles.slideTitle}>
                ЯК ДРЕСИРУВАТИ СВОГО ДРАКОНА, НЕЗАБАРОМ З'ЯВИТЬСЯ У КІНОТЕАТРАХ
              </h2>
            </div>
          </div>

          <div className={styles.sliderNavigation}>
            <div className={styles.scrollbarLeftArrow} onClick={handlePrev}>
              <img
                className={styles.arrowImage}
                src="/Arrow-L.svg"
                alt="Стрілка вліво"
              />
            </div>
            <div className={styles.scrollbarRightArrow} onClick={handleNext}>
              <img
                className={styles.arrowImage}
                src="/Arrow-R.svg"
                alt="Стрілка вправо"
              />
            </div>
          </div>
        </div>

        <div className={styles.movieDetails}>
          {movies.length > 0 &&
            movies.map((movie, index) => (
              <div key={index} className={styles.moviePosterWrapper}>
                <Link to={`/movie/${movie.id}`}>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className={styles.moviePoster}
                  />
                </Link>
                <h2>{movie.title}</h2>
                <p>
                  {movie.duration} {movie.ageRestriction}
                </p>
                <p>{movie.genres.join(", ")}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
