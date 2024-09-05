"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const express_1 = __importDefault(require("express"));
function normalizePort(val) {
    const port = Number.parseInt(val, 10);
    if (Number.isNaN(port)) {
        // named pipe
        return 3000;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return 3000;
}
function run() {
    const app = (0, express_1.default)();
    const port = normalizePort(process.env.PORT || '3000');
    app.get('/', (req, res) => {
        res.send('Welcome to Express & TypeScript Server');
    });
    app.listen(port, () => {
        //console.log(`Server is Fire at http://localhost:${port}`);
    });
}
