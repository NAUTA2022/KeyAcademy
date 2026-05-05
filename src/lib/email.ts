import emailjs from '@emailjs/browser';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');

export async function sendRegistrationEmail({
  toEmail,
  toName,
  eventTitle,
  eventDate,
  eventLocation,
  agenda,
}: {
  toEmail: string;
  toName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  agenda: string;
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    import.meta.env.VITE_EMAILJS_REGISTRATION_TEMPLATE_ID || '',
    {
      to_email: toEmail,
      to_name: toName,
      event_title: eventTitle,
      event_date: eventDate,
      event_location: eventLocation || 'Online',
      agenda,
      reply_to: 'hola@keylab.academy',
    },
  );
}
