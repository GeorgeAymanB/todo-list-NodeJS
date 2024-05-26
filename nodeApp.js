const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile('todo.html', 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                // Process the content and send the response
                fs.readFile('tasks.txt', 'utf8', (err, tasksContent) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        const taskList = tasksContent.split('\n').filter(task => task.trim() !== '');
                        const taskItems = taskList.map(task => {
                            const taskText = task.trim();
                            const isDone = taskText.endsWith(" (DONE)");
                            const taskDisplay = isDone ? taskText.slice(0, -7) : taskText;
                            const taskClass = isDone ? 'done-task' : '';
                            return `<li class="${taskClass}">${taskDisplay}</li>`;
                        }).join('');
                        const updatedContent = content.replace('<ol id="taskList"></ol>', `<ol id="taskList">${taskItems}</ol>`);
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(updatedContent);
                    }
                });
            }
        });
    } else if (req.url === '/tasks.txt' && req.method === 'GET') {
        fs.readFile('tasks.txt', 'utf8', (err, tasksContent) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(tasksContent);
            }
        });
    } else if (req.url === '/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const parsedBody = querystring.parse(body);
            const task = parsedBody.task;

            fs.appendFile('tasks.txt', task.toString() + '\n', 'utf8', err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                }
            });
        });
    } else if (req.url === '/update' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const parsedBody = JSON.parse(body);
            const originalText = parsedBody.originalText;
            const newText = parsedBody.newText;

            fs.readFile('tasks.txt', 'utf8', (err, tasksContent) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    const updatedTasksContent = tasksContent.replace(originalText, newText);
                    fs.writeFile('tasks.txt', updatedTasksContent, 'utf8', err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                        } else {
                            // Respond with a success message
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Task updated successfully' }));
                        }
                    });
                }
            });
        });
    } else if (req.method === 'DELETE' && req.url === '/clear') {
        fs.writeFile('tasks.txt', '', (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Tasks cleared successfully');
            }
        });
    } else if (req.url === '/wallpaper.jpg') {
        const imagePath = path.join(__dirname, 'wallpaper.jpg');
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(8082, () => {
    console.log('Server is running on port 8082');
});
