const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

const server = app.listen(8000, () => {
	console.log('Running...');
});

const io = socket(server);

let tasks = [];

io.on('connection', (socket) => {
	socket.emit('updateData', tasks);
	socket.on('addTask', (task) => {
		tasks.push(task);
		socket.broadcast.emit('addTask', task);
	});
	socket.on('removeTask', (id) => {
		tasks = tasks.filter((task) => task.id !== id);
		socket.broadcast.emit('removeTask', id);
	});
	socket.on('editTask', (id, name) => {
		tasks = tasks.map((task) => (task.id === id ? { ...task, name: name } : task));
		socket.broadcast.emit('editTask', id, name);
	});
});

app.use((req, res) => {
	res.status(404).json({ message: 'Not found...' });
});
