class FormManager {
    constructor() {
        // Initialize after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.formFields = document.querySelectorAll('.formField, .responseButton');
        this.formData = {}; // Add formData object to store calculated values
        this.initializeFormFields();
        console.log('Form Manager initialized with fields:', this.formFields);
    }

    calculateAge(dateString) {
        // Check if the date format is valid (MM/DD/YYYY)
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            console.log('Invalid date format. Please use MM/DD/YYYY');
            return null;
        }

        const [month, day, year] = dateString.split('/');
        const dob = new Date(year, month - 1, day); // month is 0-based
        const today = new Date();
        
        let age = today.getFullYear() - dob.getFullYear();
        
        // Adjust age if birthday hasn't occurred this year
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        return age;
    }

    initializeFormFields() {
        this.formFields.forEach(field => {
            if (field.classList.contains('responseButton')) {
                const key = field.getAttribute('name'); // Get the key from the name attribute
                const storedValue = localStorage.getItem(key); // Retrieve stored value from local storage

                // Set the button's state based on stored value
                if (storedValue !== null) {
                    field.disabled = false; // Enable the button if a value exists
                }

                // Add click event listener for the button
                field.addEventListener('click', () => {
                    const value = field.getAttribute('data-value') === 'true'; // Get the boolean value
                    localStorage.setItem(key, value); // Save the response in local storage using the key
                    console.log('Response saved:', key, value); // Log the response
                });
            } else {
                const key = field.getAttribute('name');
                const storedValue = localStorage.getItem(key);
                
                if (storedValue) {
                    field.value = storedValue;
                    console.log(`Initialized ${key} with value:`, field.value);
                }

                // Regular input storage
                field.addEventListener('input', (e) => {
                    localStorage.setItem(e.target.name, e.target.value);
                });

                // Move age calculation to blur event
                if (field.name === 'DOB') {
                    field.addEventListener('blur', (e) => {
                        const age = this.calculateAge(e.target.value);
                        if (age) {
                            this.formData.age = age;
                            localStorage.setItem('Age', age.toString());
                            console.log(`Calculated age: ${age}`);
                        }
                    });
                }

                field.addEventListener('change', (e) => {
                    localStorage.setItem(e.target.name, e.target.value);
                });
            }
        });
    }

    clearData() {
        this.formFields.forEach(field => {
            localStorage.removeItem(field.id); // Remove each input's value from local storage
            field.value = ''; // Clear the input field
        });
        console.log('Cleared all form data from local storage');
    }
}

// Create and export a single instance
const formManager = new FormManager();

// Make sure calculateAge is included in the export
export default {
    ...formManager,
    calculateAge: formManager.calculateAge.bind(formManager)
}; 