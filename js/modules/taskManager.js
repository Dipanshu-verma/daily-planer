 
import { generateId, formatDate } from './utils.js';
import { saveTasks } from './storage.js';

 
export class Task {
    constructor(text, category = 'personal') {
        this.id = generateId();
        this.text = text.trim();
        this.category = category;
        this.completed = false;
        this.createdAt = new Date();
    }
}

 
export class TaskManager {
    constructor(initialTasks = []) {
        this.tasks = initialTasks;
        this.listeners = {
            taskAdded: [],
            taskRemoved: [],
            taskToggled: [],
            tasksCleared: [],
            tasksUpdated: []
        };
    }
   
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
     
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    
    addTask(text, category = 'personal') {
        if (!text || !text.trim()) {
            throw new Error('Task text cannot be empty');
        }
        
        const task = new Task(text, category);
        this.tasks.unshift(task); // Add to beginning for newest first
        
        saveTasks(this.tasks);
        this.emit('taskAdded', task);
        this.emit('tasksUpdated', this.tasks);
        
        return task;
    }
    
   
    removeTask(taskId) {
        const index = this.tasks.findIndex(task => task.id === taskId);
        
        if (index === -1) {
            return false;
        }
        
        const removedTask = this.tasks.splice(index, 1)[0];
        
        saveTasks(this.tasks);
        this.emit('taskRemoved', removedTask);
        this.emit('tasksUpdated', this.tasks);
        
        return true;
    }
    
    
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (!task) {
            return null;
        }
        
        task.completed = !task.completed;
        
        saveTasks(this.tasks);
        this.emit('taskToggled', task);
        this.emit('tasksUpdated', this.tasks);
        
        return task;
    }
    
   
    clearAllTasks() {
        const count = this.tasks.length;
        this.tasks = [];
        
        saveTasks(this.tasks);
        this.emit('tasksCleared', count);
        this.emit('tasksUpdated', this.tasks);
        
        return count;
    }
    
 
    getAllTasks() {
        return [...this.tasks];
    }
    
   
    getTasksByCategory(category) {
        return this.tasks.filter(task => task.category === category);
    }
    
    
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }
    
  
    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }
    
   
    getStats() {
        const total = this.tasks.length;
        const completed = this.getCompletedTasks().length;
        const pending = this.getPendingTasks().length;
        
        const byCategory = {};
        this.tasks.forEach(task => {
            byCategory[task.category] = (byCategory[task.category] || 0) + 1;
        });
        
        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            byCategory
        };
    }
}

 
export function renderTask(task) {
    const dateString = formatDate(task.createdAt);
    
    return `
        <li class="task-item ${task.completed ? 'completed' : ''}" 
            data-task-id="${task.id}" 
            data-category="${task.category}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                data-task-id="${task.id}"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-category ${task.category}">${task.category}</span>
            <span class="task-date">${dateString}</span>
            <button class="delete-btn" data-task-id="${task.id}">Delete</button>
        </li>
    `;
}

 
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
 
export function updateTaskCounter(stats) {
    const counter = document.getElementById('taskCounter');
    if (counter) {
        counter.innerHTML = `
            <span class="counter-text">
                Total: ${stats.total} | Completed: ${stats.completed} | Pending: ${stats.pending}
            </span>
        `;
    }
}