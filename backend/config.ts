import dotenv from "dotenv";
import path from "path";

// Load .env from the project root regardless of where the process is started,
// and BEFORE any other module reads process.env.
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3030", 10),
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "whatsapp",
  },
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    database: process.env.MYSQL_DATABASE || "whatsapp",
  },
  // Default country code prepended to local numbers (Egypt).
  countryCode: process.env.COUNTRY_CODE || "20",
  // Pause between messages in bulk sends, to reduce ban risk.
  messageDelayMs: parseInt(process.env.MESSAGE_DELAY_MS || "60000", 10),
  // Optional group JID that receives the xlsx send report. Empty = no report.
  reportGroupId: process.env.REPORT_GROUP_ID || "",
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || "50", 10),
};
