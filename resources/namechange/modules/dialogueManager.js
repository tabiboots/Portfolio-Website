import { eventBus } from './eventBus.js';

export default class DialogueManager {
    constructor() {
        this.container = document.querySelector(".dialogueTextBox");
        this.speeds = {
            pause: 500,
            slow: 80,
            normal: 40,
            fast: 30,
        };
        this.characters = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.currentTimeout = null;
        this.currentInterval = null;
    }

    clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.characters = [];
        this.currentIndex = 0;
        this.isAnimating = false;

        // Set to idle state when clearing
        const profileBunny = document.querySelector('.profileBunny');
        if (profileBunny) {
            profileBunny.classList.remove('animate');
            profileBunny.classList.add('idle');
        }
    }

    loadDialogue(dialogueArray, options = {}) {
        if (!dialogueArray || !Array.isArray(dialogueArray)) {
            console.warn('Invalid dialogue sequence provided:', dialogueArray);
            return;
        }

        // If overwrite is true, force clear any current animation
        const firstLine = dialogueArray[0];
        if (firstLine?.overwrite && this.isAnimating) {
            this.forceStop();
        } else if (this.isAnimating) {
            return;
        }

        this.clear();
        this.isAnimating = true;

        const profileBunny = document.querySelector('.profileBunny');
        if (profileBunny) {
            // Only animate if the first line doesn't have lilDudeText or lover
            const firstLine = dialogueArray[0];
            if (!firstLine?.lilDudeText && !firstLine?.lover) {
                profileBunny.classList.remove('idle');
                profileBunny.classList.add('animate');
            }
        }

        const processDialogue = (index) => {
            if (index >= dialogueArray.length) {
                this.isAnimating = false;
                if (profileBunny) {
                    profileBunny.classList.remove('animate');
                    profileBunny.classList.add('idle');
                }
                return;
            }

            const line = dialogueArray[index];

            if (line && line.clear) {
                setTimeout(() => {
                    this.clear();
                    this.isAnimating = false;
                    if (profileBunny) {
                        profileBunny.classList.remove('animate');
                        profileBunny.classList.add('idle');
                    }
                    this.loadDialogue(dialogueArray.slice(index + 1));
                }, line.delay || 200);
                return;
            }

            if (line && line.string) {
                const dialogueText = typeof line.string === 'function' 
                    ? line.string(localStorage)
                    : line.string;

                this.printLine({ ...line, string: dialogueText }, () => {
                    processDialogue(index + 1);
                });
            } else {
                processDialogue(index + 1);
            }
        };

        processDialogue(0);
    }

    forceStop() {
        // Clear any ongoing timeouts or intervals
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }

        // Reset animation state
        this.isAnimating = false;
        
        // Clear the text box
        this.clear();

        // Reset bunny animation if needed
        const profileBunny = document.querySelector('.profileBunny');
        if (profileBunny) {
            profileBunny.classList.remove('animate');
            profileBunny.classList.add('idle');
        }
    }

    printLine(line, callback) {
        this.currentLine = line;
        // Split the string by <br> tags first
        const lines = line.string.split('<br>');
        
        lines.forEach((textLine, lineIndex) => {
            // Process each character in the line
            textLine.split("").forEach(character => {
                const span = document.createElement("span");
                span.textContent = character === " " ? "\u00A0" : character;
                span.style.opacity = "0";
                
                if (line.class) {
                    if (Array.isArray(line.class)) {
                        span.classList.add(...line.class);
                    } else {
                        span.classList.add(line.class);
                    }
                }
                
                if (line.shake === true) {
                    span.classList.add('shake');
                    span.style.animationDelay = `${Math.random() * 0.5}s`;
                }

                if (line.lilDudeText === true) {
                    span.classList.add('lilDudeText');
                }

                if (line.lover === true) {
                    span.classList.add('lover');
                }
                
                this.container.appendChild(span);
                this.characters.push({
                    span: span,
                    speed: this.speeds[line.speed]
                });
            });
            
            // Add line break if this isn't the last line
            if (lineIndex < lines.length - 1) {
                this.container.appendChild(document.createElement("br"));
                // Add the line break to the characters array to maintain timing
                this.characters.push({
                    span: document.createElement("br"),
                    speed: this.speeds[line.speed]
                });
            }
        });

        this.container.appendChild(document.createElement("br"));
        this.animateText(callback);
    }

    animateText(callback) {
        if (this.currentIndex < this.characters.length) {
            this.characters[this.currentIndex].span.style.opacity = "1";
            this.currentIndex++;

            setTimeout(() => this.animateText(callback), 
                this.characters[this.currentIndex - 1].speed);
        } else {
            this.currentIndex = 0;
            if (this.currentLine && this.currentLine.onComplete) {
                eventBus.emit(this.currentLine.onComplete);
            }
            if (callback) callback();
        }
    }

    getCurrentLineDuration() {
        if (this.characters.length === 0) return 0;
        return this.characters[0].speed * this.characters.length;
    }
}
