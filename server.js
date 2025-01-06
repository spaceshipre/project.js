const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

// Path to the JSON file
const usersFilePath = path.join(__dirname, 'users.json');
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Middleware to parse JSON data
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Read users from the JSON file
function readUsers() {
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}
function readTasks() {
    if (!fs.existsSync(tasksFilePath)) {
        fs.writeFileSync(tasksFilePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(tasksFilePath, 'utf-8'));
}

// Write users to the JSON file
function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}
function writeTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Both fields are required.' });
    }

    const users = readUsers();

    // Find a user with matching email and password
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        return res.json({ success: true, message: 'Login successful.' });
    }

    res.status(401).json({ success: false, message: 'Invalid email or password.' });
});



// Handle user registration
app.post('/register', (req, res) => {
    const { username,email, password } = req.body;

    if (!username || !email || !password ) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const users = readUsers();

    // Check if the username already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ success: false, message: 'Username already exists.' });
    }

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ success: false, message: 'email already exists.' });
    }


    // Add the new user
    users.push({ username,email, password });
    writeUsers(users);

    res.json({ success: true, message: 'User registered successfully.' });
});




// Get tasks for a specific user
app.get('/tasks', (req, res) => {
    const { email } = req.query;
    const tasks = readTasks().filter(task => task.email === email);
    res.json(tasks);
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { email, name, dueDate, description } = req.body;
    const tasks = readTasks();
    const newTask = { id: Date.now(), email, name, dueDate, description };
    tasks.push(newTask);
    writeTasks(tasks);
    res.json({ success: true, message: 'Task added successfully' });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);  // Extract task ID from the URL
    const { name, dueDate, description, email } = req.body;  // Extract task details from the body

    // Check if all required fields are provided
    if (!name || !dueDate || !description) {
        return res.status(400).json({ message: 'All fields are required to update the task.' });
    }

    console.log('Received update request for task:', req.body);  // Log the incoming data for debugging

    // Read tasks from the file
    let tasks = readTasks();

    // Find the task by ID
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });  // Task not found
    }

    // Update the task in memory
    tasks[taskIndex] = { 
        ...tasks[taskIndex],  // Retain other fields of the task that you don’t want to update
        name, 
        dueDate, 
        description, 
        email
    };

    console.log('Updated Task:', tasks[taskIndex]);  // Log the updated task for debugging

    // Save the updated tasks list to the file
    writeTasks(tasks);  // Write updated tasks array to tasks.json

    // Respond with a success message
    res.json({ message: 'Task updated successfully' });
});



// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    let tasks = readTasks();
    tasks = tasks.filter(task => task.id != id || task.email !== email);
    writeTasks(tasks);
    res.json({ success: true, message: 'Task deleted successfully' });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});






















