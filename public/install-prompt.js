// PWA Install Popup Implementation

let deferredPrompt = null;
let installButton = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    createInstallPopup();
    setupInstallPrompt();
});

// Create the custom install popup HTML
function createInstallPopup() {
    const popup = document.createElement('div');
    popup.id = 'install-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 320px;
        text-align: center;
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <div style="margin-bottom: 15px;">
            <img src="/icon-192x192.png" alt="MenuBuddy" style="width: 64px; height: 64px; border-radius: 12px;">
        </div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Install MenuBuddy</h3>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
            Get quick access to restaurant menus. Install our app for a better experience!
        </p>
        <div style="display: flex; gap: 10px;">
            <button id="install-cancel" style="
                flex: 1;
                padding: 12px;
                background: #f0f0f0;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
            <button id="install-confirm" style="
                flex: 1;
                padding: 12px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Install</button>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'install-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: none;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Add event listeners
    document.getElementById('install-cancel').addEventListener('click', hideInstallPopup);
    document.getElementById('install-confirm').addEventListener('click', installPWA);
    overlay.addEventListener('click', hideInstallPopup);
}

// Setup the beforeinstallprompt event listener
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('PWA install prompt triggered');
        
        // Prevent the default install prompt
        event.preventDefault();
        
        // Store the event for later use
        deferredPrompt = event;
        
        // Show our custom popup after a delay (optional)
        setTimeout(() => {
            showInstallPopup();
        }, 5000); // Show after 5 seconds
        
        // Or show immediately based on user interaction
        // showInstallPopup();
    });
    
    // Listen for successful installation
    window.addEventListener('appinstalled', (event) => {
        console.log('PWA installed successfully');
        hideInstallPopup();
        deferredPrompt = null;
        
        // Optional: Show thank you message
        showThankYouMessage();
    });
}

// Show the custom install popup
function showInstallPopup() {
    document.getElementById('install-overlay').style.display = 'block';
    document.getElementById('install-popup').style.display = 'block';
}

// Hide the install popup
function hideInstallPopup() {
    document.getElementById('install-overlay').style.display = 'none';
    document.getElementById('install-popup').style.display = 'none';
}

// Handle install button click
async function installPWA() {
    if (!deferredPrompt) {
        console.log('No install prompt available');
        return;
    }
    
    try {
        // Show the install prompt
        const result = await deferredPrompt.prompt();
        console.log('Install prompt result:', result);
        
        // Wait for user choice
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        // Clear the prompt
        deferredPrompt = null;
        hideInstallPopup();
        
    } catch (error) {
        console.error('Error during installation:', error);
        hideInstallPopup();
    }
}

// Optional: Show thank you message after installation
function showThankYouMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    message.textContent = 'MenuBuddy installed successfully! 🎉';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

// Optional: Show install button in your UI
function addInstallButtonToUI() {
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Install App';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        display: none;
    `;
    
    installBtn.addEventListener('click', showInstallPopup);
    document.body.appendChild(installBtn);
    
    // Show button when install prompt is available
    window.addEventListener('beforeinstallprompt', () => {
        installBtn.style.display = 'block';
    });
    
    // Hide button after installation
    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
    });
}

// For iOS Safari - Show manual install instructions
function showIOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone;
    
    if (isIOS && !isInStandaloneMode) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #007bff;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        popup.innerHTML = `
            <div>Install MenuBuddy: Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
            ">×</button>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    }
}

// Initialize iOS instructions
document.addEventListener('DOMContentLoaded', showIOSInstallInstructions);