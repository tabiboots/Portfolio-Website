import DialogueManager from './modules/dialogueManager.js';
import dialogueSequences from './modules/dialogueData.js';
import inactivityReset from './modules/inactivityReset.js';

// Initialize dialogue manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    inactivityReset.init();
    const dialogueManager = new DialogueManager();
    
    // Get current page name from URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Load initial dialogue for current page if it exists
    if (dialogueSequences[pageName]?.initial) {
        dialogueManager.loadDialogue(dialogueSequences[pageName].initial);
    }

    // Make the dialogue manager globally accessible
    window.dialogueManager = dialogueManager;

    // Make dialogueSequences globally accessible
    window.dialogueSequences = dialogueSequences;
});


