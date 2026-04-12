import emailjs from "emailjs-com";

emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_USER_ID || "");

interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
}

export async function sendNotificationEmail(params: EmailParams) {
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
      {
        to_email: params.to_email,
        to_name: params.to_name,
        subject: params.subject,
        message: params.message,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
