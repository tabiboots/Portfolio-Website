export function createHearts(button) {
    const numHearts = 3;
    
    for (let i = 0; i < numHearts; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        const rect = button.getBoundingClientRect();
        
        // Calculate spread positions across button width
        const spreadStep = rect.width / (numHearts + 1);  // +1 to leave margin on edges
        const xPosition = rect.left + (spreadStep * (i + 1));  // i+1 to skip the first step
        
        heart.style.left = xPosition + 'px';
        heart.style.top = (rect.top + 10) + 'px';
        
        // Slightly randomize the upward movement
        heart.style.setProperty('--x', (Math.random() * 40 - 20) + 'px');  // Reduced random spread
        heart.style.setProperty('--rotate', (Math.random() * 90 - 45) + 'deg');
        
        document.body.appendChild(heart);
        
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }
} 

export function createWalkingAnimation(sprite) {
    // Set initial scale and transform origin
    gsap.set(sprite, { 
        scaleX: 6,
        scaleY: 6,
        transformOrigin: "center center",
        width: "18px",
        height: "18px"
    });
    
    const walkTimeline = gsap.timeline();  // No repeats

    walkTimeline
        .to(sprite, {
            backgroundPosition: "-72px",
            duration: 2,
            ease: "steps(4)",  // 4 frame animation
            repeat: 2  // Only the sprite animation repeats
        })
        .to(sprite, {
            x: "+=250",  // Move 100px right
            duration: 6,
            ease: "steps(24)"  // Makes the movement more step-like
        }, 0);  // The 0 makes both animations start together

    return walkTimeline;
}

export function initializeDivingAnimation() {
    gsap.registerPlugin(MotionPathPlugin);

    const spriteTimeline = gsap.timeline({
        repeat: 0
    });

    spriteTimeline.to(".lilDudeDiving", {
        backgroundPosition: "-54px",
        duration: 2,
        ease: "steps(3)"
    });

    const moveTimeline = gsap.timeline({
        repeat: 0
    });

    moveTimeline.to(".lilDudeDiving", {
        duration: 1.5,
        motionPath: {
            path: [
                {x: 0, y: 0},
                {x: 50, y: -30},
                {x: 100, y: -20},
                {x: 150, y: 29}
            ],
            curviness: 1.2
        },
        ease: "steps(4)"
    });

    const masterTimeline = gsap.timeline({
        onComplete: () => {
            const sprite = document.querySelector('.lilDudeDiving');
            sprite.classList.remove('lilDudeDiving');
            sprite.classList.add('lilDudeWalking');
            createWalkingAnimation(sprite).play();
        }
    });
    masterTimeline
        .add(spriteTimeline, 0)
        .add(moveTimeline, 0);
        
    return masterTimeline;
}