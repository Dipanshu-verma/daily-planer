 
import { debounce } from './utils.js';

 
export function filterTasks(tasks, query = '', category = 'all') {
    let filtered = [...tasks];
    
    
    if (category !== 'all') {
        filtered = filtered.filter(task => task.category === category);
    }
     
    if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

 
function updateSearchStats(total, query, category) {
    const statsElement = document.getElementById('searchStats');
    if (!statsElement) return;
    
    let message = '';
    
    if (query.trim() || category !== 'all') {
        const filters = [];
        if (query.trim()) filters.push(`"${query}"`);
        if (category !== 'all') filters.push(`category: ${category}`);
        
        message = `Found ${total} task${total !== 1 ? 's' : ''} matching ${filters.join(' and ')}`;
    }
    
    statsElement.textContent = message;
}

 
export function initSearch(onSearch) {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!searchInput || !filterButtons.length) return;
    
    let currentCategory = 'all';
    
   
    const debouncedSearch = debounce((query) => {
        const results = onSearch(query, currentCategory);
        updateSearchStats(results.length, query, currentCategory);
    }, 300);
    
   
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            
            currentCategory = button.dataset.category;
            
           
            const query = searchInput.value;
            const results = onSearch(query, currentCategory);
            updateSearchStats(results.length, query, currentCategory);
        });
    });
    
     
    const clearSearch = () => {
        searchInput.value = '';
        filterButtons.forEach(btn => btn.classList.remove('active'));
        filterButtons[0].classList.add('active'); // Reset to 'All'
        currentCategory = 'all';
        const results = onSearch('', 'all');
        updateSearchStats(results.length, '', 'all');
    };
    
  
    window.clearSearch = clearSearch;
    
    return {
        clearSearch,
        getCurrentQuery: () => searchInput.value,
        getCurrentCategory: () => currentCategory
    };
}