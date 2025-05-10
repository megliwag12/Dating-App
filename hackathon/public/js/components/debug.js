/**
 * Debug helper for DataMatch components
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug component loaded');
  window.debugComponentLoaded = true;

  // Add debug button with a short delay to ensure it appears even if other scripts are slow
  setTimeout(function() {
    addDebugButton();
    console.log('Debug button added');
  }, 500);
});

function addDebugButton() {
  const debugBtn = document.createElement('button');
  debugBtn.id = 'debug-btn';
  debugBtn.textContent = 'Debug Info';
  debugBtn.style.position = 'fixed';
  debugBtn.style.bottom = '20px';
  debugBtn.style.left = '20px';
  debugBtn.style.zIndex = '9999';
  debugBtn.style.padding = '10px 15px';
  debugBtn.style.backgroundColor = '#8a2be2';
  debugBtn.style.color = 'white';
  debugBtn.style.border = 'none';
  debugBtn.style.borderRadius = '6px';
  debugBtn.style.cursor = 'pointer';
  
  debugBtn.addEventListener('click', function() {
    showDebugInfo();
  });
  
  document.body.appendChild(debugBtn);
}

function showDebugInfo() {
  console.log('=== DEBUG INFO ===');
  
  // Show all script elements
  console.log('Loaded scripts:');
  document.querySelectorAll('script').forEach((script, index) => {
    console.log(`${index + 1}. ${script.src || 'inline script'}`);
  });
  
  // Check for deep data elements
  console.log('\nDeep Data Elements:');
  ['connect-spotify', 'spotify-data', 'purchase-data', 'dietary-form', 'texting-data'].forEach(id => {
    const el = document.getElementById(id);
    console.log(`#${id}: ${el ? 'Found' : 'NOT FOUND'}`);
  });
  
  // Check for review elements
  console.log('\nReview Elements:');
  ['ex-partners-content', 'friends-content', 'work-content', 'family-content'].forEach(id => {
    const el = document.getElementById(id);
    console.log(`#${id}: ${el ? 'Found' : 'NOT FOUND'}`);
  });
  
  const reviewTabs = document.querySelectorAll('.review-tab');
  console.log('\nReview Tabs:', reviewTabs.length);
  reviewTabs.forEach((tab, index) => {
    console.log(`${index + 1}. data-target="${tab.getAttribute('data-target')}"`);
  });
  
  // Show notification with results
  const debugInfo = document.createElement('div');
  debugInfo.style.position = 'fixed';
  debugInfo.style.top = '50%';
  debugInfo.style.left = '50%';
  debugInfo.style.transform = 'translate(-50%, -50%)';
  debugInfo.style.backgroundColor = 'white';
  debugInfo.style.padding = '20px';
  debugInfo.style.borderRadius = '10px';
  debugInfo.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
  debugInfo.style.zIndex = '10000';
  debugInfo.style.maxWidth = '400px';
  debugInfo.style.maxHeight = '80vh';
  debugInfo.style.overflow = 'auto';
  
  debugInfo.innerHTML = `
    <h3 style="margin-top: 0; color: #8a2be2">Debug Information</h3>
    <p>Check browser console for detailed output.</p>
    <p><strong>Script Status:</strong> ${window.reviewsComponentLoaded ? 'Reviews loaded' : 'Reviews not loaded'} | 
       ${window.deepDataComponentLoaded ? 'Deep Data loaded' : 'Deep Data not loaded'}</p>
    <p><strong>Components Loaded:</strong> ${document.querySelectorAll('script[src*="components"]').length}</p>
    <p><strong>CSS Loaded:</strong> ${document.querySelector('link[href*="components.css"]') ? 'Yes' : 'No'}</p>
    <div style="text-align: center; margin-top: 15px;">
      <button id="close-debug" style="padding: 5px 15px; background: #8a2be2; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(debugInfo);
  
  document.getElementById('close-debug').addEventListener('click', function() {
    document.body.removeChild(debugInfo);
  });
}