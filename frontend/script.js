document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('analyze-form');
    const input = document.getElementById('repo-url');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');
    
    // Content containers
    const summaryContent = document.getElementById('summary-content');
    const improvementsContent = document.getElementById('improvements-content');
    const readmeContent = document.getElementById('readme-content');

    // Automatically determine the backend URL based on where the frontend is running
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalhost 
        ? 'http://localhost:3000' 
        : 'https://agentops-ai-node-backend.onrender.com';
        
    const API_URL = `${baseUrl}/api/v1/analyze-repo`;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = input.value.trim();
        if (!url) return;

        // Reset state
        errorMsg.textContent = '';
        resultsSection.classList.add('hidden');
        submitBtn.classList.add('loading');
        input.disabled = true;
        submitBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl: url })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            errorMsg.textContent = error.message.includes('Failed to fetch') 
                ? 'Network error or CORS issue. Is the backend running on localhost:3000?' 
                : `Error: ${error.message}`;
        } finally {
            // Restore UI state
            submitBtn.classList.remove('loading');
            input.disabled = false;
            submitBtn.disabled = false;
        }
    });

    function displayResults(data) {
        // 1. Summary
        summaryContent.textContent = data.summary || 'No summary provided.';

        // 2. Improvements
        improvementsContent.innerHTML = '';
        if (data.improvements && Array.isArray(data.improvements) && data.improvements.length > 0) {
            data.improvements.forEach(improvement => {
                const li = document.createElement('li');
                li.textContent = improvement;
                improvementsContent.appendChild(li);
            });
        } else {
            improvementsContent.innerHTML = '<li>No improvements suggested.</li>';
        }

        // 3. Readme (Markdown parsing)
        if (data.readme) {
            // Use marked to parse markdown to HTML, and DOMPurify to sanitize it
            const rawHtml = marked.parse(data.readme);
            const cleanHtml = DOMPurify.sanitize(rawHtml);
            readmeContent.innerHTML = cleanHtml;
        } else {
            readmeContent.textContent = 'No README generated.';
        }

        // Show results
        resultsSection.classList.remove('hidden');
        
        // Staggered animation for result cards
        const cards = document.querySelectorAll('.result-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${0.1 * (index + 1)}s`;
        });
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});
