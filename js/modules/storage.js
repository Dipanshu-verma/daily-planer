 
const STORAGE_KEY = 'dailyPlannerTasks';

 
export function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
    }
}

 
export function loadTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const tasks = JSON.parse(stored);
            // Convert date strings back to Date objects
            return tasks.map(task => ({
                ...task,
                createdAt: new Date(task.createdAt)
            }));
        }
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
    }
    return [];
}

 
export function clearAllTasks() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing tasks from localStorage:', error);
    }
}

 
export function getStorageInfo() {
    try {
        const used = JSON.stringify(loadTasks()).length;
        const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
        return {
            used,
            total,
            percentage: (used / total) * 100
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return { used: 0, total: 0, percentage: 0 };
    }
}