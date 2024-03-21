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

app.get('/', (req, res) => {
    res.send('Node.js WebSocket server is running!');
});

// Endpoint to receive data from the lambda and forward to the client via WebSocket
app.post('/process-task', express.json(), (req, res) => {
    const {sessionId, ...data} = req.body; // Destructure to separate sessionId from other data
    sockets.forEach(socket => {
        // Include the sessionId in the data sent to each client
        socket.emit('lambdaData', { sessionId, ...data });
    });
    res.json({status: 'Data sent to WebSocket clients.'});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
