import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "../styles/ProfileModal.module.css";

const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) {
        console.error("Error when receiving a user:", authError.message);
        return;
      }

      const currentUser = authData.user;
      setUser(currentUser);

      // Отримання role і username з таблиці profiles
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("role, username")
        .eq("user_id", currentUser.id)
        .single();

      if (profileError) {
        console.error("Error when receiving a profile:", profileError.message);
      } else {
        setRole(profileData.role);
        setUsername(profileData.username);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem("user");
      onClose();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error.message);
      alert(
        "Виникла помилка при виході з системи. Будь ласка, спробуйте ще раз."
      );
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Нові паролі не збігаються.");
      return;
    }

    try {
      // Оновлення паролю через Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert("Помилка зміни паролю: " + error.message);
      } else {
        alert("Пароль успішно змінено.");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Помилка зміни паролю:", error.message);
      alert("Виникла помилка при зміні пароля.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {!isEditing ? (
          <>
            <div className={styles.header}>
              <div className={styles.avatar}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="User"
                />
              </div>
              <div>
                <div className={styles.username}>
                  {username || user?.email || "Guest"}
                </div>
                <div className={styles.role}>
                  Група користувача: {role || "User"}
                </div>
              </div>
            </div>

            <div className={styles.buttonGrid}>
              <button
                className={styles.actionButton}
                onClick={() => setIsEditing(true)}
              >
                ⚙️ Редагувати профіль
              </button>
              <button className={styles.actionButton} onClick={handleLogout}>
                ↩️ Вийти з аккаунту
              </button>
              {role === "admin" && (
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    onClose();
                    navigate("/admin/panel");
                  }}
                >
                  🛠️ Адмін панель
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.editSection}>
              <h3>🔒 Змінна паролю</h3>

              <input
                type="password"
                placeholder="Старий пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={styles.inputField}
              />

              <input
                type="password"
                placeholder="Новий пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.inputField}
              />

              <input
                type="password"
                placeholder="Підтвердіть новий пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
              />

              <div className={styles.buttonGrid}>
                <button
                  className={styles.actionButton}
                  onClick={handlePasswordChange}
                >
                  ✅ Підтвердити
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => setIsEditing(false)}
                >
                  🔙 Назад
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
