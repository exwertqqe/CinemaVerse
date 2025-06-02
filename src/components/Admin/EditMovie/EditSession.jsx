import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionApi from "../../../api/Sessions";
import { sessionSchema } from "../../../types/zod";
import ModalWrapper from "../../ModalWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FieldInput, SubmitButton, Label } from "../../FormUI";
import styles from "./editSession.module.css";
import Button from "../../Button/index";

const FormBox = ({ children }) => {
  return <div className={styles.box}>{children}</div>;
};

const EditSession = ({ movieId }) => {
  const { findAll, addNewSession, removeSession, updateSession } = SessionApi();

  const [sessions, setSessions] = useState([]);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [isAddNew, setAddNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionSchema),
  });

  const handleStartEditing = (session) => {
    setCurrentSession(session);
    reset(session);
    setIsEditingSession(true);
  };

  const handleCloseEditing = () => {
    setIsEditingSession(false);
    setCurrentSession(null);
    reset();
  };

  const handleChangeAddNew = () => {
    setAddNew((prev) => !prev);
    reset();
  };

  const handleCloseAddNew = () => {
    setAddNew(false);
    reset();
  };

  const handleRemoveSession = async (sessionId) => {
    try {
      await removeSession(sessionId);
      const updated = await findAll(movieId);
      setSessions(updated);
    } catch (err) {
      console.error("Failed to remove session:", err);
    }
  };

  const handleUpdateSession = async (data) => {
    if (!currentSession) return;

    try {
      await updateSession(currentSession.id, data);
      handleCloseEditing();
      const updated = await findAll(movieId);
      setSessions(updated);
    } catch (err) {
      console.error("Failed to update session:", err);
    }
  };

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const sessionToAdd = {
        date: data.date,
        time: data.time,
        price: parseInt(data.price),
        numberofseats: parseInt(data.numberofseats),
        bookedseats: 0,
        seats: [],
        hall: data.hall,
      };

      await addNewSession({ session: sessionToAdd, movieId }); // передаєш movieId

      alert("Сеанс успішно додано");
      navigate("/admin/panel");
    } catch (error) {
      console.error("Error adding new session:", error);
      alert("Не вдалося додати сеанс");
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await findAll(movieId);
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [movieId]);

  const renderFormModal = (isEditing) => (
    <ModalWrapper
      handleClose={isEditing ? handleCloseEditing : handleCloseAddNew}
    >
      <div style={{ padding: "10px 0" }}>
        <h2>{isEditing ? "Редагувати сесію" : "Створити сесію"}</h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormBox>
            <Label htmlFor="date">Дата</Label>
            <FieldInput
              label="Дата"
              error={errors.date}
              id="date"
              type="date"
              {...register("date")}
            />
            <Label htmlFor="time">Час</Label>
            <FieldInput
              label="Час"
              error={errors.time}
              id="time"
              type="time"
              step="60"
              {...register("time")}
            />
            <Label htmlFor="hall">Зал</Label>
            <FieldInput
              label="Зал"
              error={errors.hall}
              id="hall"
              type="text"
              {...register("hall")}
            />
            <Label htmlFor="price">Ціна</Label>
            <FieldInput
              label="Ціна"
              error={errors.price}
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
            <Label htmlFor="seatsNumber">Кількість місць</Label>
            <FieldInput
              label="Кількість місць"
              error={errors.seatsNumber}
              id="seatsNumber"
              type="number"
              {...register("seatsNumber", { valueAsNumber: true })}
            />
          </FormBox>
          <SubmitButton text="Зберегти" />
        </Form>
      </div>
    </ModalWrapper>
  );

  return (
    <div>
      <Button onClick={handleChangeAddNew} type="button">
        Додати нову сесію
      </Button>

      {isAddNew && renderFormModal(false)}
      {isEditingSession && renderFormModal(true)}

      <div className={styles.list}>
        {sessions.length === 0 ? (
          <p className={styles.is_empty}>Сесій ще немає.</p>
        ) : (
          sessions.map((session) => (
            <div
              className={styles.list_item}
              key={session.id}
              style={{
                borderBottom: "1px solid #ccc",
                margin: "10px 0",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "7px",
                  paddingBottom: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleStartEditing(session)}
                >
                  Редагувати
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSession(session.id)}
                >
                  Видалити
                </button>
              </div>

              <div>
                Дата: <strong>{session.date}</strong>
              </div>
              <div>
                Час: <strong>{session.time}</strong>
              </div>
              <div>
                Зал: <strong>{session.hall}</strong>
              </div>
              <div>
                Ціна: <strong>{session.price} грн</strong>
              </div>
              <div>
                Кількість місць: <strong>{session.numberOfSeats}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditSession;
