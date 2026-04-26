function onGameEvent() {
    // Trigger dialogue in response to game events
    dialogueManager.loadDialogue(dialogueSequences.page1.onHoverBox1);
}

// Or create custom triggers
function createTrigger(element, dialogueKey) {
    element.addEventListener('mouseover', () => {
        dialogueManager.loadDialogue(dialogueSequences[currentPage][dialogueKey]);
    });
}