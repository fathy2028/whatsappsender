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

/* ── Channels (WhatsApp newsletters) ────────────────────────────────────── */

export interface Channel {
  jid: string;
  name: string;
  description: string;
  invite: string;
  /** Public https://whatsapp.com/channel/… link, empty if unknown. */
  link: string;
  /** Live follower count; null when WhatsApp couldn't be reached. */
  subscribers: number | null;
  createdAt: string;
}

export const getChannels = async (username: string): Promise<Channel[]> => {
  const response = await axios.get(`/api/channels/${username}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const createChannel = async (payload: {
  username: string;
  name: string;
  description: string;
  picture: File | null;
}): Promise<{ jid: string; link: string }> => {
  const fd = new FormData();
  fd.append("username", payload.username);
  fd.append("name", payload.name);
  fd.append("description", payload.description);
  if (payload.picture) fd.append("picture", payload.picture);
  const response = await axios.post("/api/channels/create", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** Add a channel you already admin (e.g. created on the phone) by its link. */
export const importChannel = async (username: string, link: string) => {
  const response = await axios.post("/api/channels/import", { username, link });
  return response.data;
};

/** Forget a channel in this app. It is not deleted on WhatsApp. */
export const removeChannel = async (username: string, jid: string) => {
  const response = await axios.post("/api/channels/remove", { username, jid });
  return response.data;
};

export const postToChannel = async (payload: {
  username: string;
  jid: string;
  message: string;
  files: File[];
}): Promise<{ sent: number; failed: number; errors: string[] }> => {
  const fd = new FormData();
  fd.append("username", payload.username);
  fd.append("jid", payload.jid);
  fd.append("message", payload.message);
  payload.files.forEach((f) => fd.append("media", f));
  const response = await axios.post("/api/channels/post", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** Send each number the channel link. Returns a job id to poll. */
export const inviteToChannel = async (payload: {
  username: string;
  jid: string;
  numbers: string[];
  message: string;
}): Promise<{ status: string; jobId: string }> => {
  const response = await axios.post("/api/channels/invite", payload);
  return response.data;
};
