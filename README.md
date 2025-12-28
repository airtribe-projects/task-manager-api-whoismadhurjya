# Task Manager API

A simple task management API built with Node.js and Express.

## Setup

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Run tests: `npm test`

## API Endpoints

### GET /tasks
- Get all tasks
- Query parameters:
  - `completed`: Filter by completion status (true/false)
  - `priority`: Filter by priority level (low/medium/high)
  - `sortBy`: Sort by creation date (createdAt/-createdAt)

### GET /tasks/:id
- Get a specific task by ID

### POST /tasks
- Create a new task
- Required fields: `title`, `description`
- Optional fields: `completed` (boolean, default: false), `priority` (low/medium/high, default: medium)

### PUT /tasks/:id
- Update an existing task
- Fields that can be updated: `title`, `description`, `completed`, `priority`

### DELETE /tasks/:id
- Delete a task by ID

### GET /tasks/priority/:level
- Get tasks by priority level (low, medium, high)