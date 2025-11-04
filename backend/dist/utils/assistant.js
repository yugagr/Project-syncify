"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssistantReply = generateAssistantReply;
const flows = {
    onboarding: "Recommended flow: 1) Create a Team → 2) Create a Project → 3) Add Boards (To Do / In Progress / Done) → 4) Invite teammates → 5) Assign tasks → 6) Track progress on Dashboard.",
    projects: "To manage projects: Projects → New Project → define goals, due dates, and owners.",
    boards: "Use boards to visualize tasks. Columns map to stages. Drag tasks between columns to update status quickly.",
    efficiency: "Efficiency tips: batch related tasks, set WIP limits on boards, use keyboard shortcuts, create recurring reminders, and review burndown weekly.",
    calendar: "Use the calendar to see due dates and plan sprints. Sync personal reminders so nothing slips.",
    teams: "Create teams and set permissions. Use roles to control access to sensitive boards and analytics.",
    analytics: "Analytics highlight throughput, cycle time, and bottlenecks. Improve by limiting WIP and shortening feedback loops.",
};
function matchIntent(text) {
    const t = text.toLowerCase();
    if (/(how|start|begin).* (use|onboard|flow|started)/.test(t))
        return flows.onboarding;
    if (/(project)/.test(t))
        return flows.projects;
    if (/(board|kanban|task)/.test(t))
        return flows.boards;
    if (/(efficien|productiv|optimi|faster|improv)/.test(t))
        return flows.efficiency;
    if (/(calendar|schedule|reminder)/.test(t))
        return flows.calendar;
    if (/(team|member|permission|role)/.test(t))
        return flows.teams;
    if (/(analytic|report|metric|dashboard)/.test(t))
        return flows.analytics;
    return "I can help with flow, projects, boards, teams, calendar, files, analytics, and efficiency tips. Ask me how to start or where you’re stuck!";
}
function generateAssistantReply(userMessage) {
    const reply = matchIntent(userMessage);
    return { role: "assistant", content: reply };
}
