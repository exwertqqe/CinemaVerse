import React, { useState, useEffect } from "react";
import styles from "../../styles/modal.module.css";
import { supabase } from "../../supabaseClient";

function Modal({ isOpen, onClose, poster, title, hall }) {
  const [sessionsData, setSessionsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedSeatsList, setBookedSeatsList] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDate("");
    setSelectedTime("");
    setName("");
    setPhone("");
    setSelectedSeats([]);
    setBookedSeatsList([]);
    setIsOrdered(false);
    setPrice(0);
    setTotalPrice(0);

    const fetchSessions = async () => {
      try {
        let { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("hall", hall);

        if (error) throw error;

        setSessionsData(data);

        const dates = Array.from(new Set(data.map((s) => s.date)));
        setAvailableDates(dates);
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    };

    fetchSessions();
  }, [isOpen, hall]);

  useEffect(() => {
    setSelectedTime("");
    setAvailableTimes([]);
    setSelectedSeats([]);
    setBookedSeatsList([]);
    setPrice(0);
    setTotalPrice(0);

    if (!selectedDate) return;
    const times = Array.from(
      new Set(
        sessionsData
          .filter((s) => s.hall === hall && s.date === selectedDate)
          .map((s) => s.time)
      )
    );
    setAvailableTimes(times);
  }, [selectedDate, sessionsData, hall]);

  useEffect(() => {
    setSelectedSeats([]);
    setBookedSeatsList([]);
    setPrice(0);
    setTotalPrice(0);

    if (!selectedTime) return;
    const session = sessionsData.find(
      (s) =>
        s.hall === hall && s.date === selectedDate && s.time === selectedTime
    );
    if (session) {
      const booked = Array.isArray(session.bookedSeatsList)
        ? session.bookedSeatsList
        : Array.from({ length: session.bookedSeats || 0 }, (_, i) => i + 1);
      setBookedSeatsList(booked);
      setPrice(session.price || 0);
    }
  }, [selectedTime, selectedDate, sessionsData, hall]);

  useEffect(() => {
    setTotalPrice(price * selectedSeats.length);
  }, [price, selectedSeats]);

  const handleSeatClick = (seatNumber) => {
    if (bookedSeatsList.includes(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (selectedDate && selectedTime && name && phone && selectedSeats.length) {
      setIsOrdered(true);
      console.log({
        movie: title,
        date: selectedDate,
        time: selectedTime,
        hall,
        seats: selectedSeats,
        totalPrice,
        customer: { name, phone },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {isOrdered ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h2>Booking Confirmed!</h2>
            <div className={styles.ticketDetails}>
              <p>
                <strong>Фільм:</strong> {title}
              </p>
              <p>
                <strong>Дата:</strong> {selectedDate}
              </p>
              <p>
                <strong>Час:</strong> {selectedTime}
              </p>
              <p>
                <strong>Зал:</strong> {hall}
              </p>
              <p>
                <strong>Сидіння:</strong> {selectedSeats.join(", ")}
              </p>
              <p>
                <strong>Загальна ціна:</strong> {totalPrice} ГРН
              </p>
            </div>
            <p className={styles.thankYou}>Дякуємо за замовлення!</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleConfirm}>
            <div className={styles.movieInfo}>
              <img
                src={poster}
                alt={`Poster of ${title}`}
                className={styles.poster}
              />
              <div className={styles.movieDetails}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.hall}>Hall: {hall}</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formSection}>
                <label className={styles.label}>
                  Час сеансу:
                  <select
                    className={styles.input}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  >
                    <option value="">Оберіть дату</option>
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  Час сеансу:
                  <select
                    className={styles.input}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!availableTimes.length}
                    required
                  >
                    <option value="">Оберіть Час</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.formSection}>
                <label className={styles.label}>
                  Ваше ім'я:
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Впишіть ваше ім'я"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label className={styles.label}>
                  Номет телефону:
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="Ваш номер телефону"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            {name && phone && selectedTime && (
              <div className={styles.seatsSection}>
                <div className={styles.seatsHeader}>
                  <h3>Оберіть місце</h3>
                </div>

                <div className={styles.seatsGrid}>
                  {Array.from({ length: 5 }).map((_, row) => (
                    <div key={row} className={styles.seatRow}>
                      {Array.from({ length: 12 }).map((_, col) => {
                        const seatNumber = row * 12 + col + 1;
                        const isBooked = bookedSeatsList.includes(seatNumber);
                        const isSelected = selectedSeats.includes(seatNumber);
                        return (
                          <div
                            key={seatNumber}
                            className={`${styles.seat} ${
                              isBooked
                                ? styles.booked
                                : isSelected
                                ? styles.selected
                                : ""
                            }`}
                            onClick={() => handleSeatClick(seatNumber)}
                          >
                            {seatNumber}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {selectedSeats.length > 0 && (
                  <div className={styles.orderSummary}>
                    <p>Вибранне місце: {selectedSeats.join(", ")}</p>
                    <p>Ціна місця: {price} UAH</p>
                    <p className={styles.totalPrice}>
                      Загальна: {totalPrice} UAH
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className={styles.confirmButton}
              disabled={
                !(
                  selectedDate &&
                  selectedTime &&
                  name &&
                  phone &&
                  selectedSeats.length
                )
              }
            >
              Замовити квиток
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Modal;
