const dialogueSequences = {
    page1: {
        initial: [
            {string: "Welcome to the:", speed: "fast"},
            {string: "NEW YORK NAME CHANGE GAME!", speed: "slow", shake: true},
            {clear: true, delay: 900}, // Clear after 2 seconds
            {string: "Let's get started!", speed: "normal", onComplete: "page1Form"},

        ],
        onHoverBox1: [
            {string: "Getting started strong.", speed: "fast", overwrite: true},
            {string: "That's a good name!", speed: "normal"},
        ],
        onClickBox2: [
            {string: "Courts can be confusing. <br>That's why I'm here to help!", speed: "normal", overwrite: true},
        ],
        onClickBox3: [
            {string: "So many counties...", speed: "normal", overwrite: true},
            {clear: true, delay: 400},
            {string: (storage) => `${storage.getItem('County')} is my favorite, <br>though!`, speed: "normal"},
        ],
        emptyBox3: [
            {string: "Try selecting your county <br>before we move on.", speed: "normal"},
        ]
    },
    page2: {
        initial: [

        ],
        onClickBox1: [
            {string: "...", speed: "pause"},
            {string: "You broke it.", speed: "normal"},
        ],
        onDoorLoad: [
            {string: "I don't know if I can jump <br>high enough to fix that.", speed: "normal"},
            {clear: true, delay: 1800},
            {string: "This is so embarrassing.", speed: "normal", onComplete: "page2Response"}
        ],
        onClickDialogue1: [
            {string: "It's ok. It happens more <br>often than you'd think.", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Let me show you the rest of <br>the form while this gets fixed.", speed: "normal", onComplete: "page2Done"}
        ],
        onClickDialogue2: [
            {string: "I know you didn't.", speed: "normal"},
            {clear: true, delay: 400},
            {string: "Your clicks are just <br>too strong!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Let me show you the rest of <br>the form while this gets fixed.", speed: "normal", onComplete: "page2Done"}
        ]
        // Add more triggered dialogues for page2
    },
    page3: {
        initial: [
            {string: "It's great to meet you!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "I'm... well I'm just a bunny.<br>I dont have a name yet.", speed: "normal"},
            {clear: true, delay: 1200},
            {string: "But this is my form! I'm here <br>to help you change your name.", speed: "normal"},
            {clear: true, delay: 700},
            {string: "That is what you're here for, <br>right?", speed: "normal", onComplete: "nameChangeButtons"},
        ],
        onNameChangeYes: [
            {string: "Wonderful! What would you like <br>your new name to be?", speed: "normal", onComplete: "newNameInput"},
        ],
        onNameChangeNo: [
            {string: "Oh...", speed: "slow"},
            {string: "I won't be very useful then.", speed: "normal"},
            {clear: true, delay: 800},
            {string: ":(", speed: "pause"}
        ],
        afterNameInput: [
            {
                string: (storage) => `${storage.getItem('NewName').split(' ')[0]}... <br>that's a beautiful name!`,
                speed: "normal",
                onComplete: "beautifulName"
            },
        ],
        beautifulName: [
            {string: "That's great to hear.", speed: "normal", onComplete: "hideNameInput"},
            {clear: true, delay: 700},
            {string: "Have you tried to change your <br>name before?", speed: "normal", onComplete: "previousNameChangePetition"},
        ],
        previousNameChangePetitionYes: [
            {string: "I always love to see <br>a repeat customer!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Could you tell me a bit about <br>your previous name change?", speed: "normal", onComplete: "previousNameChangeSpecify"},
        ],
        previousNameChangePetitionNo: [
            {string: "Well I hope to make this <br>process as easy as possible!", speed: "normal", onComplete: "movetoPage4"},
        ]
    },
    page4: {
        initial: [
            {string: "STOP RIGHT THERE!!!", speed: "normal",shake: true, lilDudeText: true, },
            { clear: true, delay: 1500},
            { string: "Someone broke our <br>form!", speed: "normal", lilDudeText: true},
            {clear: true, delay: 700},
            {string: "As the form sherrif, I <br>gotta find out who did it!", speed: "normal", lilDudeText: true, onComplete: "page4Response"},
        ],
        onClickDenial: [
            {string: "Hmmm. That sounds <br>suspicious.", speed: "normal", lilDudeText: true},
            {clear: true, delay: 700},
            {string: "Don't worry! I won't tell <br>him anything!", speed: "normal"},
            {clear: true, delay: 1200},
            {string: "I'm gonna have to ask you <br>a few questions.", speed: "normal", lilDudeText: true, onComplete: "page4Questions"},
        ],
        onClickIDidIt: [
            {string: "A CRIMINAL! <br>I knew it.", speed: "normal", lilDudeText: true},
            {clear: true, delay: 700},
            {string: "I'm gonna have to ask you <br>a few questions.", speed: "normal", lilDudeText: true, onComplete: "page4Questions"},
        ],
        onClickConvictedOfCrimeYes: [
            {string: "Well, I guess we all <br>have a past.", speed: "normal", lilDudeText: true},
            {clear: true, delay: 700},
            {string: "Can you give me <br>some more details?", speed: "normal", lilDudeText: true, onComplete: "page4ConvictedOfCrimeDetails"},
        ],
        moveToJudgementsorLiens: [
            {string: "Any self respecting <br>sherrif can't stop", speed: "normal", lilDudeText: true},
            {clear: true, delay: 200},
            {string: "their interrogation there!", speed: "normal", lilDudeText: true, onComplete: "page4JudgementsorLiens"},
        ],
        moveToPartyToAction: [
            {string: "Just one last question...", speed: "normal", lilDudeText: true, onComplete: "page4PartyToAction"},
        ],
        yesPartyToAction: [
            {string: "What court case are you <br>a party to?", speed: "normal", lilDudeText: true, onComplete: "page4BankruptcyJudgmentsLiensPartySpecify"},
        ],
        fixFormButton: [
            {
                string: () => {
                    if (window.userChoice === 'denial') {
                        return "And my interrogation result <br>is...";
                    } else {
                        return "I appreciate your <br>honesty earlier...";
                    }
                },
                speed: "normal",
                lilDudeText: true
            },
            {clear: true, delay: 900},
            {
                string: () => {
                    if (window.userChoice === 'denial') {
                        return "Inconclusive!";
                    } else {
                        return "Honesty is important <br>in legal forms!";
                    }
                },
                speed: "normal",
                lilDudeText: true
            },
            {clear: true, delay: 700},
            {
                string: () => {
                    if (window.userChoice === 'denial') {
                        return "Could you help us fix <br>that form, though?";
                    } else {
                        return "We need your help fixing <br>that form, though.";
                    }
                },
                speed: "normal",
                lilDudeText: true,
                onComplete: "fixFormButton"
            }
        ],
        endPage4: [
            {string: "Great! I'll have our bunny <br>take you to that page.", speed: "normal", lilDudeText: true, onComplete: "moveToPage5"}
        ]
    },
    page5: {
        initial: [
            {string: "I found this hammer for you!", speed: "normal", onComplete: "page5Hammer"},
            {clear: true, delay: 700}, 
            {string: "Click it to pick it up and <br>hammer the form into shape!", speed: "normal"},
        ],
        bunnyBonked: [
            {string: "Ouch! <br>Hit the form! not me!", speed: "normal", overwrite: true},
        ],
        formFixed: [
            {string: "Great job! Now we can fill out<br>your home address.", speed: "normal", overwrite: true},
        ],
        DOBandPlaceofBirth: [
            {string: "Just a few more questions that <br>we couldn't get to earlier.", speed: "normal", onComplete: "page5SubmitCurrentAddress"},
        ]
    },
    page6: {
        initial: [
            {string: "Almost done!", speed: "normal", onComplete: "page6Roses"},
            {clear: true, delay: 700},
            {string: "Wait... <br>What's this?", speed: "fast"},
            {clear: true, delay: 1200},
            {string: "Hi, beautiful.", speed: "normal", lover: true},
            {string: "Do you like the roses?", speed: "normal", lover: true },
            {clear: true, delay: 1100},
            {string: "I picked them just for you.", speed: "normal", lover: true},
            {clear: true, delay: 1000},
            {
                string: (storage) => `Mom always said I'd <br>marry a ${storage.getItem('NewName').split(' ')[0]}.`,
                speed: "normal",
                lover: true,
            },
            {clear: true, delay: 1100},
            {string: "Wait, you're not married <br>already, are you?", speed: "normal", lover: true, onComplete: "MaritalStatus"}
        ],
        CurrentlyMarriedYes: [
            {string: "That's ok. I don't mind <br>some competition.", speed: "normal", lover: true},
            {clear: true, delay: 700},
            {string: "Have you ever been married <br>before?", speed: "normal", lover: true, onComplete: "MaritalStatusPreviousMarriage"},
        ],
        CurrentlyMarriedNo: [
            {string: "Oh how lovely!", speed: "normal", lover: true},
            {clear: true, delay: 700},
            {string: "Have you ever been married <br>before?", speed: "normal", lover: true, onComplete: "MaritalStatusPreviousMarriage"},
        ],
        Interlude: [
            {string: "I'm sorry, but we have <br>important legal work to do!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Please bunny! Just a <br>couple more questions!", speed: "normal", lover: true},
            {clear: true, delay: 1000},
            {string: "I fell in love when I saw <br>them fixing that form!", speed: "normal", lover: true},
            {clear: true, delay: 1000},
            {string: "They looked so strong, <br>yet gentle.", speed: "normal", lover: true},
            {clear: true, delay: 1000},
            {string: "Fine... but keep it snappy!", speed: "normal"},
            {clear: true, delay: 1000},
            {string: "I have six beautiful <br>kittens. You'd love them!", speed: "normal", lover: true},
            {clear: true, delay: 1000},
            {string: "Do you have any kids?", speed: "normal", lover: true, onComplete: "ChildrenUnder21"},
        ],
        Under21Yes: [
            {string: "Oh! This is actually <br>relevant to the form!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Do you pay any child support?", speed: "normal", onComplete: "catWalk"},
            {clear: true, delay: 700},
            {string: "What a mood killer <br>for our first date.", speed: "normal", lover: true, onComplete: "ChildSupport"}
        ],
        moveToSpousalSupport: [
            {string: "Just thought of another <br>question!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Uhhhhggggg.", speed: "normal", lover: true},
            {clear: true, delay: 700},
            {string: "Do you pay any spousal <br>support?", speed: "normal", onComplete: "SpousalSupport"}
        ],
        moveToPage7: [
            {string: "Well, I can see you're <br>a little busy right now.", speed: "normal", lover: true},
            {clear: true, delay: 700},
            {string: `Come visit me at the <br>${localStorage.getItem('County')} courthouse though.`, speed: "normal", lover: true},
            {clear: true, delay: 700},
            {string: "I spend most of my time <br>there, anyway.", speed: "normal", lover: true, onComplete: "loverFadeOut"}
        ]
    },
    page7: {
        initial: [
            {string: "This is the last page of the <br>form. So exciting!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Just a couple questions as our <br>machines fill out your info.", speed: "normal", onComplete: "SealingRequest"}
        ],
        SealingRequestYes: [
            {string: "Could you tell me why you want <br>this record sealed?", speed: "normal", onComplete: "SealingRequestSpecify"}
        ],
        supportingForms: [
            {string: "Two more questions!", speed: "normal", onComplete: "supportingForms"}
        ],
        supportingFormsYes: [
            {string: "What forms would you like to <br>include with your request?", speed: "normal", onComplete: "supportingFormsSpecify"}
        ],
        reasonForNameChange: [
            {string: "Finally, why do you want to <br>change your name?", speed: "normal", onComplete: "reasonForNameChange"}
        ],
        moveToPage8: [
            {string: "With that, our journey <br>comes to an end.", speed: "normal"},
            {clear: true, delay: 700},
            {string: " ", speed: "normal", onComplete: "moveToPage8"}
        ]
    },
    page8: {
        initial: [
            {string: "Thank you for using the <br>New York Name Change Game!", speed: "normal"},
            {clear: true, delay: 700},
            {string: "Click the button above to <br>download your form.", speed: "normal"},
        ]
    }
}; 

export default dialogueSequences;