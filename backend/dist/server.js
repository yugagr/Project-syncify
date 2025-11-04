"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const test_1 = __importDefault(require("./routes/test"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const boards_1 = __importDefault(require("./routes/boards"));
const chat_1 = __importDefault(require("./routes/chat"));
const files_1 = __importDefault(require("./routes/files"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const teams_1 = __importDefault(require("./routes/teams"));
const activity_1 = __importDefault(require("./routes/activity"));
const assistant_1 = __importDefault(require("./routes/assistant"));
const realtime_1 = __importDefault(require("./sockets/realtime"));
const reminders_1 = require("./utils/reminders");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- Test route
app.use("/test", test_1.default);
// --- Main API routes
app.use("/auth", auth_1.default);
app.use("/projects", projects_1.default);
app.use("/boards", boards_1.default);
app.use("/chat", chat_1.default);
app.use("/files", files_1.default);
app.use("/analytics", analytics_1.default);
app.use("/calendar", calendar_1.default);
app.use("/teams", teams_1.default);
app.use("/activity", activity_1.default);
app.use("/assistant", assistant_1.default);
// --- Initialize real-time events
(0, realtime_1.default)(io);
// --- Background worker (optional)
(0, reminders_1.startReminderWorker)();
// --- Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
