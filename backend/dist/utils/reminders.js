"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderWorker = startReminderWorker;
const node_cron_1 = __importDefault(require("node-cron"));
const supabase_1 = __importDefault(require("../config/supabase"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
    }
    catch (err) {
        console.warn('sendEmail failed', err.message || err);
    }
}
function startReminderWorker() {
    const cronExpr = process.env.REMINDER_CRON || '*/5 * * * *';
    node_cron_1.default.schedule(cronExpr, async () => {
        console.log('Reminder worker running at', new Date().toISOString());
        try {
            const now = new Date().toISOString();
            const next24 = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
            const { data: tasks, error } = await supabase_1.default.from('tasks').select('*').gte('due_date', now).lte('due_date', next24).is('reminder_sent', false).limit(200);
            if (error)
                throw error;
            for (const t of tasks || []) {
                if (t.assignee) {
                    await sendEmail(t.assignee, `Task due soon: ${t.title}`, `Your task "${t.title}" is due on ${t.due_date}.`);
                }
                await supabase_1.default.from('tasks').update({ reminder_sent: true }).eq('id', t.id);
            }
        }
        catch (err) {
            console.warn('Reminder worker error', err.message || err);
        }
    });
}
