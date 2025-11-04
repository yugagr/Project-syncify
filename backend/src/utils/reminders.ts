import cron from 'node-cron';
import supabase from '../config/supabase';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendEmail(to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
  } catch (err) { console.warn('sendEmail failed', (err as any).message || err); }
}

export function startReminderWorker() {
  const cronExpr = process.env.REMINDER_CRON || '*/5 * * * *';
  cron.schedule(cronExpr, async () => {
    console.log('Reminder worker running at', new Date().toISOString());
    try {
      const now = new Date().toISOString();
      const next24 = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const { data: tasks, error } = await supabase.from('tasks').select('*').gte('due_date', now).lte('due_date', next24).is('reminder_sent', false).limit(200);
      if (error) throw error;
      for (const t of tasks || []) {
        if (t.assignee) {
          await sendEmail(t.assignee, `Task due soon: ${t.title}`, `Your task "${t.title}" is due on ${t.due_date}.`);
        }
        await supabase.from('tasks').update({ reminder_sent: true }).eq('id', t.id);
      }
    } catch (err) {
      console.warn('Reminder worker error', (err as any).message || err);
    }
  });
}
