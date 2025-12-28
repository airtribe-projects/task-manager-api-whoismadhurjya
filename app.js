const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tasks = [
    { id: 1, title: 'Complete Node.js homework', description: 'Finish the Node.js assignment', completed: false, priority: 'medium', createdAt: new Date().toISOString() },
    { id: 2, title: 'Learn Express.js basics', description: 'Study Express.js fundamentals', completed: true, priority: 'high', createdAt: new Date().toISOString() },
    { id: 3, title: 'Build task manager application', description: 'Create a complete task manager', completed: false, priority: 'high', createdAt: new Date().toISOString() }
];

const getNextId = () => {
    return tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
};

const validateTask = (req, res, next) => {
    const { title, description, completed, priority } = req.body;

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                error: 'Title must be a non-empty string'
            });
        }
        if (title.length > 200) {
            return res.status(400).json({
                error: 'Title cannot exceed 200 characters'
            });
        }
    }

    if (description !== undefined) {
        if (typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({
                error: 'Description must be a non-empty string'
            });
        }
        if (description.length > 500) {
            return res.status(400).json({
                error: 'Description cannot exceed 500 characters'
            });
        }
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'Completed field must be a boolean value'
        });
    }

    if (priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                error: 'Priority must be one of: low, medium, high'
            });
        }
    }

    next();
};

app.get('/tasks', (req, res) => {
    const { completed, priority, sortBy } = req.query;

    let filteredTasks = [...tasks];

    if (completed !== undefined) {
        const completedBool = completed === 'true';
        filteredTasks = filteredTasks.filter(task => task.completed === completedBool);
    }

    if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    if (sortBy === 'createdAt') {
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === '-createdAt') {
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
        success: true,
        data: filteredTasks,
        count: filteredTasks.length
    });
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            error: 'Invalid task ID. ID must be a number.'
        });
    }

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({
            error: `Task with ID ${taskId} not found`
        });
    }

    res.json({
        success: true,
        data: task
    });
});

app.post('/tasks', validateTask, (req, res) => {
    const { title, description, completed = false, priority = 'medium' } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({
            error: 'Title is required and must be a non-empty string'
        });
    }

    if (!description || description.trim().length === 0) {
        return res.status(400).json({
            error: 'Description is required and must be a non-empty string'
        });
    }

    const newTask = {
        id: getNextId(),
        title: title.trim(),
        description: description.trim(),
        completed: completed,
        priority: priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task created successfully'
    });
});

app.put('/tasks/:id', validateTask, (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            error: 'Invalid task ID. ID must be a number.'
        });
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: `Task with ID ${taskId} not found`
        });
    }

    const { title, description, completed, priority } = req.body;

    if (title !== undefined) {
        tasks[taskIndex].title = title.trim();
    }
    if (description !== undefined) {
        tasks[taskIndex].description = description.trim();
    }
    if (completed !== undefined) {
        tasks[taskIndex].completed = completed;
    }
    if (priority !== undefined) {
        tasks[taskIndex].priority = priority;
    }
    tasks[taskIndex].updatedAt = new Date().toISOString();

    res.json({
        success: true,
        data: tasks[taskIndex],
        message: 'Task updated successfully'
    });
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
        return res.status(400).json({
            error: 'Invalid task ID. ID must be a number.'
        });
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: `Task with ID ${taskId} not found`
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.json({
        success: true,
        data: deletedTask,
        message: 'Task deleted successfully'
    });
});

app.get('/tasks/priority/:level', (req, res) => {
    const priorityLevel = req.params.level;
    const validPriorities = ['low', 'medium', 'high'];

    if (!validPriorities.includes(priorityLevel)) {
        return res.status(400).json({
            error: 'Priority level must be one of: low, medium, high'
        });
    }

    const filteredTasks = tasks.filter(task => task.priority === priorityLevel);

    res.json({
        success: true,
        data: filteredTasks,
        count: filteredTasks.length
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong on the server!'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: `Route ${req.originalUrl} not found`
    });
});

app.listen(PORT, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Task Manager API server is running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET    /tasks                    - Get all tasks`);
    console.log(`  GET    /tasks/:id                - Get a specific task`);
    console.log(`  POST   /tasks                    - Create a new task`);
    console.log(`  PUT    /tasks/:id                - Update a task`);
    console.log(`  DELETE /tasks/:id                - Delete a task`);
    console.log(`  GET    /tasks/priority/:level    - Get tasks by priority level`);
});

module.exports = app;