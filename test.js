const request = require('supertest');
const app = require('./app');

describe('Task Manager API', () => {
    // Test GET /tasks - Get all tasks
    describe('GET /tasks', () => {
        it('should return all tasks', async () => {
            const response = await request(app)
                .get('/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeGreaterThanOrEqual(0);
        });

        it('should return filtered tasks by completed status', async () => {
            const response = await request(app)
                .get('/tasks?completed=true')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(task => {
                expect(task.completed).toBe(true);
            });
        });

        it('should return filtered tasks by priority', async () => {
            const response = await request(app)
                .get('/tasks?priority=high')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(task => {
                expect(task.priority).toBe('high');
            });
        });
    });

    // Test GET /tasks/:id - Get specific task
    describe('GET /tasks/:id', () => {
        it('should return a specific task', async () => {
            const response = await request(app)
                .get('/tasks/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.id).toBe(1);
            expect(response.body.data).toHaveProperty('title');
            expect(response.body.data).toHaveProperty('description');
            expect(response.body.data).toHaveProperty('completed');
            expect(response.body.data).toHaveProperty('priority');
        });

        it('should return 404 for non-existent task', async () => {
            await request(app)
                .get('/tasks/9999')
                .expect(404);
        });

        it('should return 400 for invalid task ID', async () => {
            await request(app)
                .get('/tasks/invalid')
                .expect(400);
        });
    });

    // Test POST /tasks - Create task
    describe('POST /tasks', () => {
        it('should create a new task', async () => {
            const newTask = {
                title: 'Test task',
                description: 'Test description'
            };

            const response = await request(app)
                .post('/tasks')
                .send(newTask)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(newTask.title);
            expect(response.body.data.description).toBe(newTask.description);
            expect(response.body.data.completed).toBe(false);
            expect(response.body.data.priority).toBe('medium');
            expect(response.body.message).toBe('Task created successfully');
        });

        it('should return 400 if title is missing', async () => {
            const invalidTask = {
                description: 'Test description'
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if title is empty', async () => {
            const invalidTask = {
                title: '',
                description: 'Test description'
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if description is missing', async () => {
            const invalidTask = {
                title: 'Test title'
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if description is empty', async () => {
            const invalidTask = {
                title: 'Test title',
                description: ''
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if title is too long', async () => {
            const invalidTask = {
                title: 'a'.repeat(201), // 201 characters, exceeding limit
                description: 'Test description'
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if description is too long', async () => {
            const invalidTask = {
                title: 'Test title',
                description: 'a'.repeat(501) // 501 characters, exceeding limit
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });

        it('should return 400 if priority is invalid', async () => {
            const invalidTask = {
                title: 'Test title',
                description: 'Test description',
                priority: 'invalid'
            };

            await request(app)
                .post('/tasks')
                .send(invalidTask)
                .expect(400);
        });
    });

    // Test PUT /tasks/:id - Update task
    describe('PUT /tasks/:id', () => {
        it('should update a task', async () => {
            const updateData = {
                title: 'Updated task title',
                description: 'Updated task description',
                completed: true,
                priority: 'high'
            };

            const response = await request(app)
                .put('/tasks/1')
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.description).toBe(updateData.description);
            expect(response.body.data.completed).toBe(updateData.completed);
            expect(response.body.data.priority).toBe(updateData.priority);
            expect(response.body.message).toBe('Task updated successfully');
        });

        it('should return 404 for updating non-existent task', async () => {
            const updateData = {
                title: 'Updated task title',
                description: 'Updated task description'
            };

            await request(app)
                .put('/tasks/9999')
                .send(updateData)
                .expect(404);
        });

        it('should return 400 for invalid task ID', async () => {
            const updateData = {
                title: 'Updated task title',
                description: 'Updated task description'
            };

            await request(app)
                .put('/tasks/invalid')
                .send(updateData)
                .expect(400);
        });

        it('should return 400 for invalid completed value', async () => {
            const updateData = {
                completed: 'not-a-boolean'
            };

            await request(app)
                .put('/tasks/1')
                .send(updateData)
                .expect(400);
        });

        it('should return 400 if priority is invalid', async () => {
            const updateData = {
                priority: 'invalid'
            };

            await request(app)
                .put('/tasks/1')
                .send(updateData)
                .expect(400);
        });
    });

    // Test DELETE /tasks/:id - Delete task
    describe('DELETE /tasks/:id', () => {
        it('should delete a task', async () => {
            const response = await request(app)
                .delete('/tasks/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.message).toBe('Task deleted successfully');
        });

        it('should return 404 for deleting non-existent task', async () => {
            await request(app)
                .delete('/tasks/9999')
                .expect(404);
        });

        it('should return 400 for invalid task ID', async () => {
            await request(app)
                .delete('/tasks/invalid')
                .expect(400);
        });
    });

    // Test GET /tasks/priority/:level - Get tasks by priority
    describe('GET /tasks/priority/:level', () => {
        it('should return tasks with specified priority', async () => {
            const response = await request(app)
                .get('/tasks/priority/high')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            response.body.data.forEach(task => {
                expect(task.priority).toBe('high');
            });
        });

        it('should return 400 for invalid priority level', async () => {
            await request(app)
                .get('/tasks/priority/invalid')
                .expect(400);
        });
    });

    // Test 404 for undefined routes
    describe('404 handler', () => {
        it('should return 404 for undefined routes', async () => {
            await request(app)
                .get('/undefined-route')
                .expect(404);
        });
    });
});