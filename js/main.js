 
import { TaskManager, renderTask, updateTaskCounter } from './modules/taskManager.js';
import { loadTasks } from './modules/storage.js';
import { initSearch, filterTasks } from './modules/search.js';
import { initBackToTop, confirm } from './modules/utils.js';

 
class DailyPlannerApp {
    constructor() {
        this.taskManager = null;
        this.searchController = null;
        this.currentFilter = { query: '', category: 'all' };
        
        this.init();
    }
    
  
    async init() {
        try {
        
            const savedTasks = loadTasks();
            this.taskManager = new TaskManager(savedTasks);
      
            this.setupEventListeners();
            
         
            this.initializeModules();
            
        
            this.renderTasks();
            this.updateUI();
            
            console.log('Daily Planner App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize the application');
        }
    }
    
 
    setupEventListeners() {
 
        const addTaskForm = document.getElementById('addTaskForm');
        addTaskForm?.addEventListener('submit', (e) => this.handleAddTask(e));
        
      
        const taskList = document.getElementById('taskList');
        taskList?.addEventListener('click', (e) => this.handleTaskListClick(e));
        taskList?.addEventListener('change', (e) => this.handleTaskListChange(e));
        
 
        const clearAllBtn = document.getElementById('clearAllBtn');
        clearAllBtn?.addEventListener('click', () => this.handleClearAllTasks());
        
 
        this.taskManager.on('tasksUpdated', () => {
            this.renderTasks();
            this.updateUI();
        });
       
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
   
    initializeModules() {
      
        this.searchController = initSearch((query, category) => {
            this.currentFilter = { query, category };
            this.renderTasks();
            return this.getFilteredTasks();
        });
        
         
        initBackToTop();
    }
    
  
    handleAddTask(e) {
        e.preventDefault();
        
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        
        if (!taskInput || !categorySelect) return;
        
        const text = taskInput.value.trim();
        const category = categorySelect.value;
        
        if (!text) {
            this.showError('Please enter a task');
            taskInput.focus();
            return;
        }
        
        try {
            this.taskManager.addTask(text, category);
            
           
            taskInput.value = '';
            taskInput.focus();
            
            this.showSuccess('Task added successfully!');
        } catch (error) {
            console.error('Error adding task:', error);
            this.showError('Failed to add task');
        }
    }
   
    handleTaskListClick(e) {
        const taskId = e.target.dataset.taskId;
        if (!taskId) return;
        
        if (e.target.classList.contains('delete-btn')) {
            this.handleDeleteTask(taskId);
        }
    }
    
  
    handleTaskListChange(e) {
        const taskId = e.target.dataset.taskId;
        if (!taskId) return;
        
        if (e.target.classList.contains('task-checkbox')) {
            this.handleToggleTask(taskId);
        }
    }
   
    handleDeleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        try {
            const success = this.taskManager.removeTask(taskId);
            if (success) {
                this.showSuccess('Task deleted successfully!');
            } else {
                this.showError('Task not found');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showError('Failed to delete task');
        }
    }
    
    
    handleToggleTask(taskId) {
        try {
            const task = this.taskManager.toggleTask(taskId);
            if (task) {
                const message = task.completed ? 'Task completed!' : 'Task marked as pending';
                this.showSuccess(message);
            } else {
                this.showError('Task not found');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showError('Failed to update task');
        }
    }
  
    handleClearAllTasks() {
        if (!confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            return;
        }
        
        try {
            const count = this.taskManager.clearAllTasks();
            this.showSuccess(`${count} task${count !== 1 ? 's' : ''} deleted successfully!`);
            
  
            if (this.searchController?.clearSearch) {
                this.searchController.clearSearch();
            }
        } catch (error) {
            console.error('Error clearing tasks:', error);
            this.showError('Failed to clear tasks');
        }
    }
    
  
    handleKeyboardShortcuts(e) {
       
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const taskInput = document.getElementById('taskInput');
            if (taskInput && taskInput.value.trim()) {
                document.getElementById('addTaskForm')?.dispatchEvent(new Event('submit'));
            }
        }
        
     
        if (e.key === 'Escape') {
            if (this.searchController?.clearSearch) {
                this.searchController.clearSearch();
            }
        }
    }
    
 
    getFilteredTasks() {
        const allTasks = this.taskManager.getAllTasks();
        return filterTasks(allTasks, this.currentFilter.query, this.currentFilter.category);
    }
    
 
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (!taskList || !emptyState) return;
        
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.remove('hidden');
            
           
            const hasFilter = this.currentFilter.query || this.currentFilter.category !== 'all';
            if (hasFilter) {
                emptyState.innerHTML = '<p>No tasks match your current filter. Try adjusting your search.</p>';
            } else {
                emptyState.innerHTML = '<p>No tasks yet. Add your first task above!</p>';
            }
        } else {
            emptyState.classList.add('hidden');
            taskList.innerHTML = filteredTasks.map(task => renderTask(task)).join('');
        }
    }
    
  
    updateUI() {
        const stats = this.taskManager.getStats();
        updateTaskCounter(stats);
         
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.disabled = stats.total === 0;
        }
    }
    
  
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
 
    showError(message) {
        this.showToast(message, 'error');
    }
    
   
    showToast(message, type = 'info') {
       
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : '#3b82f6'
        });
        
 
        document.body.appendChild(toast);
        
    
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
      
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

 
document.addEventListener('DOMContentLoaded', () => {
    new DailyPlannerApp();
});

 
export default DailyPlannerApp;