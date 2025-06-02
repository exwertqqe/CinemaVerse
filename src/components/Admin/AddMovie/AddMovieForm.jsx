import React from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Імпорт supabase клієнта
import { supabase } from "../../../supabaseClient";

// types
import { movieRegisterSchema } from "../../../types/zod/movieSchema";

// components
import {
  FieldInput,
  FieldArray,
  FieldTextarea,
  FieldRow,
  SubmitButton,
} from "../../FormUI/index";
import { MovieForm } from "../Forms/index";

const AddMovieForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movieRegisterSchema),
    defaultValues: {
      genres: [],
    },
  });

  const posterWatcher = watch("poster");
  const genres = watch("genres");

  const onSubmit = async (data) => {
    try {
      // Додаємо "+" до вікового обмеження і "хвилин" до тривалості
      const modifiedData = {
        ...data,
        ageRestriction: `${data.ageRestriction}+`,
        duration: `${data.duration} хвилин`,
      };

      const randomId = Math.floor(100000 + Math.random() * 900000); // Генеруємо випадковий ID

      const { error } = await supabase.from("Movies").insert([
        {
          id: String(randomId), // Додаємо ID як рядок
          poster: modifiedData.poster,
          title: modifiedData.title,
          description: modifiedData.description,
          trailerLink: modifiedData.trailerLink,
          releaseDate: modifiedData.releaseDate,
          country: modifiedData.country,
          duration: modifiedData.duration,
          ageRestriction: modifiedData.ageRestriction,
          genres: modifiedData.genres,
          ratings: modifiedData.ratings,
        },
      ]);

      if (error) throw error;

      alert("Фільм успішно додано!");
      navigate("/admin/panel");
    } catch (error) {
      console.error("Помилка при додаванні фільму:", error);
      alert("Сталася помилка при збереженні фільму.");
    }
  };

  const handleAddGenre = (genre) => {
    if (!genre || genres.includes(genre)) return;
    setValue("genres", [...genres, genre]);
  };

  const handleRemoveGenre = (index) => {
    const updated = [...genres];
    updated.splice(index, 1);
    setValue("genres", updated);
  };

  return (
    <MovieForm
      posterWatcher={posterWatcher}
      handleSubmit={handleSubmit(onSubmit)}
    >
      <FieldInput
        error={errors.poster}
        id="poster"
        type="text"
        placeholder="Посилання на постер фільму"
        {...register("poster")}
      />
      <FieldInput
        error={errors.title}
        id="title"
        type="text"
        placeholder="Назва фільму"
        {...register("title")}
      />
      <FieldTextarea
        error={errors.description}
        id="description"
        placeholder="Опис фільму"
        {...register("description")}
      />
      <FieldInput
        error={errors.trailerLink}
        id="trailerLink"
        type="text"
        placeholder="Посилання на трейлер фільму"
        {...register("trailerLink")}
      />
      <FieldInput
        error={errors.releaseDate}
        id="releaseDate"
        type="date"
        placeholder="Дата випуску фільму"
        {...register("releaseDate", { valueAsDate: true })}
      />
      <FieldInput
        error={errors.country}
        id="country"
        type="text"
        placeholder="Країна"
        {...register("country")}
      />
      <FieldInput
        error={errors.duration}
        id="duration"
        type="number"
        placeholder="Тривалість фільму (вводити без слів, слово хвилин додасться автоматично)"
        {...register("duration", { valueAsNumber: true })}
      />
      <FieldInput
        error={errors.ageRestriction}
        id="ageRestriction"
        type="number"
        placeholder="Вік для перегляду (вводдити без +, він додасться автоматично)"
        {...register("ageRestriction", { valueAsNumber: true })}
      />
      <FieldArray
        items={genres}
        onAdd={handleAddGenre}
        onRemove={handleRemoveGenre}
        error={errors.genres}
      />
      <FieldRow>
        <FieldInput
          error={errors.ratings?.imdb}
          id="ratings.imdb"
          type="number"
          placeholder="Оцінка на IMDb"
          style={{ width: "100%" }}
          {...register("ratings.imdb", { valueAsNumber: true })}
        />
        <FieldInput
          error={errors.ratings?.rottenTomatoes}
          id="ratings.rottenTomatoes"
          type="number"
          placeholder="Оцінка на Rotten Tomatoes"
          style={{ width: "100%" }}
          {...register("ratings.rottenTomatoes", { valueAsNumber: true })}
        />
      </FieldRow>

      <SubmitButton text={"Додати фільм"} />
    </MovieForm>
  );
};

export default AddMovieForm;
