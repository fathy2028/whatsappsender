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

/* ── Campaigns, jobs and contacts ───────────────────────────────────────── */

export interface BulkJob {
  id: string;
  type: string;
  username: string;
  status: "running" | "completed";
  total: number;
  sent: number;
  notOnWhatsapp: number;
  failed: number;
  errors: string[];
  startedAt: string;
  finishedAt?: string;
}

export interface Contact {
  jid: string;
  phoneNumber: string;
  name: string;
  /** True when the number is saved in your WhatsApp address book. */
  saved: boolean;
}

/**
 * Send an optional message plus any number of attachments to any mix of
 * group jids and contact jids. Returns a job id to poll for progress.
 */
export const sendCampaign = async (payload: {
  username: string;
  targets: string[];
  message: string;
  files: File[];
}): Promise<{ status: string; jobId: string }> => {
  const fd = new FormData();
  fd.append("username", payload.username);
  fd.append("targets", JSON.stringify(payload.targets));
  fd.append("message", payload.message);
  // Repeated field name — express-fileupload collects these into an array.
  payload.files.forEach((f) => fd.append("media", f));
  const response = await axios.post("/campaign", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getJob = async (id: string): Promise<BulkJob> => {
  const response = await axios.get(`/jobs/${id}`);
  return response.data;
};

export const getContacts = async (
  username: string,
  savedOnly = false
): Promise<{ contacts: Contact[]; total: number; saved: number }> => {
  const response = await axios.get(`/api/contacts/${username}`, {
    params: savedOnly ? { saved: "1" } : undefined,
  });
  const data = response.data ?? {};
  return {
    contacts: Array.isArray(data.contacts) ? data.contacts : [],
    total: Number(data.total) || 0,
    saved: Number(data.saved) || 0,
  };
};

/** Ask WhatsApp to re-push the address book for this session. */
export const syncContacts = async (
  username: string
): Promise<{ total: number; saved: number }> => {
  const response = await axios.post("/api/contacts/sync", { username });
  return { total: Number(response.data?.total) || 0, saved: Number(response.data?.saved) || 0 };
};
