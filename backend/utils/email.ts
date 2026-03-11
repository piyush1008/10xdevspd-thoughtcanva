// @ts-ignore - nodemailer types will be provided by installed package/@types in the real environment
import nodemailer from "nodemailer";

const requiredEnvVars = [
  "GMAIL_USER",
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
];

const hasAllEmailEnv = requiredEnvVars.every((key) => Boolean(process.env[key]));

const transporter = hasAllEmailEnv
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    })
  : null;

export const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  if (!hasAllEmailEnv || !transporter) {
    console.error(
      "[Email] Gmail OAuth2 env vars are not fully configured; skipping email send"
    );
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL ?? process.env.GMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`[Email] Sent email to ${to} with subject "${subject}"`);
  } catch (err) {
    console.error("[Email] Failed to send email", err);
  }
};

