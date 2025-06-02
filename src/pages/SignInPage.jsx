import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "../styles/auth.module.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Підключаємо supabase клієнт

const signInSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(3, "Логін повинен мати довжину не менше 3 символів")
    .nonempty("Вкажіть логін")
    .refine(
      (val) => {
        if (val.includes("@")) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val);
        }
        return true;
      },
      {
        message: "Неправильний формат електронної пошти",
      }
    ),
  password: z
    .string()
    .min(3, "Пароль повинен містити щонайменше 6 символів")
    .nonempty("Вкажіть пароль"),
});

const SignInPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Використовуємо метод signInWithPassword для перевірки користувача
      const { error, user } = await supabase.auth.signInWithPassword({
        email: data.usernameOrEmail, // Передаємо емейл
        password: data.password,
      });

      if (error) {
        throw error; // Якщо є помилка (наприклад, неправильний емейл або пароль), викидаємо її
      }

      // Якщо все правильно, редиректимо користувача
      navigate("/");
    } catch (error) {
      console.error(error);
      setError("general", {
        type: "manual",
        message: "Ваш логін або пароль невірні. Спробуйте ще раз!",
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Вхід</h1>

      {errors.general && (
        <p className={styles.field__error}>{errors.general.message}</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.field}>
          <input
            id="usernameOrEmail"
            className={styles.field__input}
            type="text"
            placeholder="Ваш логін або email"
            {...register("usernameOrEmail")}
          />
          {errors.usernameOrEmail && (
            <p className={styles.field__error}>
              {errors.usernameOrEmail.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <input
            id="password"
            className={styles.field__input}
            placeholder="Ваш пароль"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className={styles.field__error}>{errors.password.message}</p>
          )}
        </div>

        <button className={styles.btn__submit} type="submit">
          Увійти
        </button>
      </form>

      <div className={styles.text}>
        Не маєте аккаунту? <a href="/signUp">Регистрація</a>
      </div>
    </div>
  );
};

export default SignInPage;
