// Fix script to remove game over modals and fix character loading
(function() {
    console.log('Fix script v2.0 running immediately...');
    
    // Function to remove all modals
    function removeAllModals() {
        try {
            console.log('Searching for modals to remove...');
            
            // Method 1: Remove by class names (most direct)
            const classBased = document.querySelectorAll('.game-over-modal, .modal, .reward-modal');
            console.log(`Found ${classBased.length} class-based modals`);
            classBased.forEach(el => {
                console.log('Removing class-based modal:', el);
                el.remove();
            });
            
            // Method 2: Remove by style attributes
            const styleBased = document.querySelectorAll(
                '[style*="position: fixed"], [style*="z-index: 1000"], [style*="transform: translate"]'
            );
            console.log(`Found ${styleBased.length} style-based elements`);
            
            styleBased.forEach(el => {
                // Only remove if it looks like a modal
                if (
                    (el.style.position === 'fixed' || el.style.position === 'absolute') &&
                    (parseInt(el.style.zIndex) >= 100 || el.style.zIndex === 'auto') &&
                    el.tagName !== 'BUTTON' && // Don't remove buttons
                    el.id !== 'wallet-container' && // Don't remove wallet container
                    el.id !== 'controls' && // Don't remove game controls
                    !el.id.includes('loading') // Don't remove loading indicators
                ) {
                    console.log('Removing style-based modal:', el);
                    el.remove();
                }
            });
            
            // Method 3: Remove by content (most aggressive, but necessary)
            const allElements = document.querySelectorAll('*');
            console.log(`Scanning ${allElements.length} elements for game over text...`);
            
            allElements.forEach(el => {
                if (el.textContent && (
                    el.textContent.includes('Game Over') || 
                    el.textContent.includes('Final Score') ||
                    el.textContent.includes('Play Again')
                )) {
                    console.log('Found element with game over text:', el);
                    
                    // Look for the parent modal container
                    let parent = el;
                    let found = false;
                    
                    // Go up to 5 levels to find a modal-like container
                    for (let i = 0; i < 5 && parent; i++) {
                        if (parent.parentElement) {
                            parent = parent.parentElement;
                            
                            // If this looks like a modal container, remove it
                            if (
                                (parent.style.position === 'fixed' || parent.style.position === 'absolute') || 
                                parseInt(parent.style.zIndex) >= 100 ||
                                (parent.className && (
                                    parent.className.includes('modal') || 
                                    parent.className.includes('game-over')
                                ))
                            ) {
                                console.log('Removing parent container:', parent);
                                parent.remove();
                                found = true;
                                break;
                            }
                        }
                    }
                    
                    // If no suitable parent was found, remove the element itself
                    if (!found) {
                        console.log('No suitable parent found, removing element itself:', el);
                        el.remove();
                    }
                }
            });
            
            console.log('Finished removing modals');
        } catch (error) {
            console.error('Error in removeAllModals:', error);
        }
    }
    
    // Function to fix character model loading
    function fixModelPaths() {
        try {
            // Add a global variable to catch model loading issues
            window.modelLoadError = false;
            
            // Override the load model function if it exists
            if (window.CharacterRenderer && CharacterRenderer.prototype.loadModel) {
                const originalLoadModel = CharacterRenderer.prototype.loadModel;
                
                CharacterRenderer.prototype.loadModel = function(name, path) {
                    console.log(`Attempting to load model: ${name} from path: ${path}`);
                    
                    // Try multiple paths to handle different environments
                    const paths = [
                        path,
                        path.replace('./assets/', '/assets/'),
                        path.replace('./assets/', '../assets/'),
                        path.replace('./assets/', '/Galaxia/assets/'),
                        path.replace('./assets/', 'assets/'),
                        `https://charlo21.github.io/Galaxia/${path.replace('./', '')}`
                    ];
                    
                    console.log('Trying paths:', paths);
                    
                    // Try each path until one works
                    let promise = originalLoadModel.call(this, name, paths[0]);
                    
                    for (let i = 1; i < paths.length; i++) {
                        promise = promise.catch(error => {
                            console.warn(`Failed to load from ${paths[i-1]}, trying ${paths[i]}`);
                            return originalLoadModel.call(this, name, paths[i]);
                        });
                    }
                    
                    return promise.catch(error => {
                        console.error(`Failed to load model ${name} from all paths:`, error);
                        window.modelLoadError = true;
                        throw error;
                    });
                };
            }
        } catch (error) {
            console.error('Error in fixModelPaths:', error);
        }
    }
    
    // Run immediately
    removeAllModals();
    fixModelPaths();
    
    // Run when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, applying fixes again...');
        removeAllModals();
        
        // Add event listeners for GitHub-specific fixes
        if (window.location.href.includes('github.io')) {
            console.log('GitHub Pages environment detected, applying additional fixes...');
            
            // Force-remove any modals that might be added later
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        removeAllModals();
                    }
                });
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        }
        
        // Run at intervals to catch any delayed modals
        setTimeout(removeAllModals, 100);
        setTimeout(removeAllModals, 500);
        setTimeout(removeAllModals, 1000);
        setTimeout(removeAllModals, 2000);
    });
})();
