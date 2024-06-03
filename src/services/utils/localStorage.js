import v1 from "uuid/v1";

export const setLocalStorageItem = item => {
  try {
    const uuid = v1();
    localStorage.setItem(uuid, JSON.stringify(item));
    return uuid;
  } catch (error) {
    console.error("localStorage setItem 오류:", error);
  }
};

export const getLocalStorageItem = key => {
  try {
    const item = localStorage.getItem(key);
    localStorage.removeItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("localStorage getItem 오류:", error);
  }
};
