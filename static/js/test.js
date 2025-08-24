// Simple test script to check if freelancers can be loaded
console.log('Test script loaded');

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    setTimeout(async function() {
        console.log('Testing freelancer loading...');
        
        const container = document.getElementById('freelancers-container');
        console.log('Container found:', container);
        
        if (container) {
            container.style.border = '2px solid red';
            container.innerHTML = '<div style="padding: 20px; background: yellow;">TESTING - Container found!</div>';
            
            try {
                const response = await fetch('/api/accounts/freelancer-profiles/');
                const data = await response.json();
                console.log('API data:', data);
                
                container.innerHTML = `
                    <div style="padding: 20px; background: lightgreen;">
                        <h3>API Test Success!</h3>
                        <p>Found ${data.length} freelancers</p>
                        <div style="background: white; padding: 10px; margin: 10px 0;">
                            <strong>First freelancer:</strong><br>
                            ${data[0]?.user?.first_name} ${data[0]?.user?.last_name}<br>
                            Skills: ${data[0]?.skills}<br>
                            Rate: $${data[0]?.hourly_rate}/hr
                        </div>
                    </div>
                `;
            } catch (error) {
                container.innerHTML = `<div style="padding: 20px; background: lightcoral;">Error: ${error.message}</div>`;
            }
        } else {
            console.error('Container not found!');
        }
    }, 1000);
});
