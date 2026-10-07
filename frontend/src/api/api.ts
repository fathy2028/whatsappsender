import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL || window.location.origin;
export const getUsernames = async () => {
  const response = await axios.get("/usernames");
  return response.data;
};
/** A WhatsApp group as returned by `GET /getgroups/:username`. */
export type Group = { name: string; id: string };

export const getGroups = async (username: string): Promise<Group[]> => {
  const response = await axios.get(`/getgroups/${username}`);
  if (!Array.isArray(response.data)) return [];
  return response.data
    .map((g): Group => ({
      // The backend sends { name, id }; tolerate a legacy { label, id } too.
      name: String(g?.name ?? g?.label ?? "").trim(),
      id: String(g?.id ?? ""),
    }))
    .filter((g) => g.id);
};
export const sendMessage = async (
  id: string,
  message: string,
  username: string
) => {
  const response = await axios.post("/id", { id, username, message });
  return response.data;
};
export const sendMessageUsingPhoneNumer = async (
  phoneNumber: string,
  message: string,
  username: string
) => {
  const response = await axios.post("/", { phoneNumber, username, message });
  return response.data;
};
export const getSummary = async (username: string) => {
  const response = await axios.post("/summery", { username });
  return response.data;
};
export const sendMessageUsingPhoneNumers = async (
  phoneNumbers: string[],
  message: string,
  username: string
) => {
  const response = await axios.post("/bulk", {
    numbers: phoneNumbers,
    username,
    message,
  });
  return response.data;
};
export const sendImage = async (formData: FormData) => {
  const response = await axios.post("/sendimage", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
export const sendVideo = async (formData: FormData) => {
  const response = await axios.post("/sendvideo", formData);
  return response.data;
};
export const sendFile = async (formData: FormData) => {
  const response = await axios.post("/sendfile", formData);
  return response.data;
};
export const sendXlsx = async (formData: FormData) => {
  const response = await axios.post("/sendxlsx", formData);
  return response.data;
};
