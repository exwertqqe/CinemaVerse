import { supabase } from "../supabaseClient";

const SessionApi = () => {
  const tableName = "sessions";

  const findAll = async (movieId) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("movieid", Number.parseInt(movieId));

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const findOne = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addNewSession = async ({ session, movieId }) => {
    try {
      const randomId = Math.floor(100000 + Math.random() * 900000); // генеруємо ID

      const { data, error } = await supabase.from("sessions").insert({
        id: String(randomId), // id як текст
        movieid: String(movieId),
        ...session,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error adding new session:", error);
      return null;
    }
  };

  const updateOne = async (sessionId, updatedSession) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updatedSession)
        .eq("id", sessionId);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error updating session:", error);
      return null;
    }
  };

  const removeOne = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error deleting session:", error);
      return null;
    }
  };

  return {
    findAll,
    findOne,
    addNewSession,
    updateOne,
    removeOne,
  };
};

export default SessionApi;
