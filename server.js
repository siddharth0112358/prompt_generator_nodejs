const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust according to your security requirements
        methods: ["GET", "POST"]
    }
});

// Placeholder for storing WebSocket connections
let sockets = [];

io.on('connection', (socket) => {
    console.log('New client connected');
    sockets.push(socket);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        sockets = sockets.filter(s => s !== socket);
    });
});

// Endpoint to receive data from the lambda and forward to the client via WebSocket
app.post('/process-task', express.json(), (req, res) => {
    const data = req.body;
    sockets.forEach(socket => socket.emit('lambdaData', data));
    res.json({status: 'Data sent to WebSocket clients.'});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
