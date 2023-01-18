import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import shortid from 'shortid';

const App = () => {
	const [tasks, setTasks] = useState();
	const [newTask, setNewTask] = useState();
	const [socket, setSocket] = useState();
	const [editId, setEditId] = useState();
	const [editName, setEditName] = useState();

	useEffect(() => {
		const socket = io('http://localhost:8000');
		socket.on('updateData', (tasks) => updateTasks(tasks));
		socket.on('removeTask', (id) => removeTask(id, true));
		socket.on('addTask', (task) => addTask(task));
		socket.on('editTask', (id, name) => editTask(id, name, true));
		setSocket(socket);
	}, []);

	const updateTasks = (tasks) => {
		setTasks(tasks);
	};

	const removeTask = (id, isServerEvent) => {
		setTasks((tasks) => tasks.filter((task) => task.id !== id));
		if (!isServerEvent) socket.emit('removeTask', id);
	};

	const inputChangeHandler = (e) => {
		setNewTask(e.target.value);
	};

	const addTask = (task) => {
		setTasks((tasks) => [...tasks, task]);
	};

	const submitForm = (e) => {
		e.preventDefault();
		let taskObj = { id: shortid(), name: newTask };
		addTask(taskObj);
		socket.emit('addTask', taskObj);
		setNewTask('');
	};

	const startEditionHandler = (id, name) => {
		setEditId(id);
		setEditName(name);
	};

	const editionInputChangeHandler = (e) => {
		setEditName(e.target.value);
	};
	const editTask = (id = editId, name = editName, isServerEvent) => {
		setTasks((tasks) => {
			return tasks.map((task) => (task.id === id ? { ...task, name: name } : task));
		});
		if (!isServerEvent) {
			socket.emit('editTask', id, name);
			setEditId();
			setEditName();
		}
	};

	return (
		<div className='App'>
			<header>
				<h1>ToDoList.app</h1>
			</header>

			<section
				className='tasks-section'
				id='tasks-section'>
				<h2>Tasks</h2>

				<ul
					className='tasks-section__list'
					id='tasks-list'>
					{tasks &&
						tasks.map((task) =>
							editId !== task.id ? (
								<li
									key={task.id}
									className='task'>
									{task.name}
									<div>
										<button
											className='btn btn--blue'
											onClick={() => startEditionHandler(task.id, task.name)}>
											Edit
										</button>
										<button
											className='btn btn--red'
											onClick={() => removeTask(task.id)}>
											Remove
										</button>
									</div>
								</li>
							) : (
								<li
									key={task.id}
									className='task'>
									<input
										className='text-input'
										autoComplete='off'
										type='text'
										id='task-name'
										value={editName}
										onChange={editionInputChangeHandler}
									/>
									<div>
										<button
											className='btn btn--blue'
											onClick={() => editTask()}>
											Save
										</button>
									</div>
								</li>
							)
						)}
				</ul>

				<form
					id='add-task-form'
					onSubmit={submitForm}>
					<input
						className='text-input'
						autoComplete='off'
						type='text'
						placeholder='Type your description'
						id='task-name'
						value={newTask}
						onChange={inputChangeHandler}
					/>
					<button
						className='btn'
						type='submit'>
						Add
					</button>
				</form>
			</section>
		</div>
	);
};

export default App;
