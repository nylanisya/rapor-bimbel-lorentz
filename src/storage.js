import { AUTH_STORAGE_KEY } from "./constants";

export const saveToLocalStorage = (pages) => {
  try {
    localStorage.setItem("raporData", JSON.stringify(pages));
  } catch (error) {
    console.error("Gagal simpan:", error);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem("raporData");
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error("Gagal baca:", error);
  }
  return null;
};

export const checkIsAuthenticated = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const setAuthenticated = (value) => {
  try {
    if (value) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Gagal simpan status login:", error);
  }
};
