import { PDFDocument } from 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.esm.min.js';

class PDFFormScanner {
    constructor() {
        this.pdfDoc = null;
        this.form = null;
    }

    async loadPDF(pdfPath) {
        try {
            console.log('Attempting to load PDF from:', pdfPath);
            const pdfBytes = await fetch(pdfPath).then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.arrayBuffer();
            });
            
            this.pdfDoc = await PDFDocument.load(pdfBytes);
            this.form = this.pdfDoc.getForm();
            
            // Log the loaded form
            console.log('PDF Form Loaded:', this.form);
        } catch (error) {
            console.error('Error loading PDF:', error);
            throw error;
        }
    }

    async fillForm() {
        if (!this.form) throw new Error('No PDF form loaded');

        // Define a mapping of field names to their types
        const fieldsToFill = {
            PetitionerName: { type: 'text', value: localStorage.getItem('PetitionerName') },
            CourtType: { type: 'dropdown', value: localStorage.getItem('CourtType') },
            NameChange: { type: 'checkbox', value: localStorage.getItem('NameChange') === 'true' },
            County: { type: 'dropdown', value: localStorage.getItem('County') },
            NewName: { type: 'text', value: localStorage.getItem('NewName') },
            PreviousNameChangePetition: { type: 'radio', value: localStorage.getItem('PreviousNameChangePetition') },
            'PreviousNameChangePetition-specify': { type: 'text', value: localStorage.getItem('PreviousNameChangePetition-specify') },
            ConvictedOfCrime: { type: 'radio', value: localStorage.getItem('ConvictedOfCrime') },
            CourtOfConviction: { type: 'text', value: localStorage.getItem('CourtOfConviction') },
            Crime: { type: 'text', value: localStorage.getItem('Crime') },
            JudgmentsOrLiens: { type: 'radio', value: localStorage.getItem('JudgmentsOrLiens') },
            Bankruptcy: { type: 'radio', value: localStorage.getItem('Bankruptcy') },
            PartyToAction: { type: 'radio', value: localStorage.getItem('PartyToAction') },
            'BankruptcyJudgmentsLiensParty-specify': { type: 'text', value: localStorage.getItem('BankruptcyJudgmentsLiensParty-specify') },
            CurrentAddress: { type: 'text', value: localStorage.getItem('CurrentAddress') },
            DOB: { type: 'text', value: localStorage.getItem('DOB') },
            PlaceOfBirth: { type: 'text', value: localStorage.getItem('PlaceofBirth') },
            Age: { type: 'text', value: localStorage.getItem('Age') },
            Date: { type: 'text', value: localStorage.getItem('Date') },
            CurrentlyMarried: { type: 'radio', value: localStorage.getItem('CurrentlyMarried') },
            PreviouslyMarried: { type: 'radio', value: localStorage.getItem('PreviouslyMarried') },
            ChildrenUnder21: { type: 'radio', value: localStorage.getItem('ChildrenUnder21') },
            ChildSupport: { type: 'radio', value: localStorage.getItem('ChildSupport')},
            ChildSupportPayments: { type: 'radio', value: localStorage.getItem('ChildSupportPayments')},
            CourtIssuingChildSupportOrder: { type: 'text', value: localStorage.getItem('CourtIssuingChildSupportOrder')},
            SupportCollectionsUnit: { type: 'text', value: localStorage.getItem('SupportCollectionsUnit')},
            ChildSupportArrears: { type: 'text', value: localStorage.getItem('ChildSupportArrears')},
            SpousalSupport: { type: 'radio', value: localStorage.getItem('SpousalSupport')},
            SpousalSupportPayments: { type: 'radio', value: localStorage.getItem('SpousalSupportPayments')},
            CourtIssuingSpousalSupportOrder: { type: 'text', value: localStorage.getItem('CourtIssuingSpousalSupportOrder')},
            SpousalSupportArrears: { type: 'text', value: localStorage.getItem('SpousalSupportArrears')},
            SealingRequest: { type: 'radio', value: localStorage.getItem('SealingRequest')},
            'SealingRequest-specify': { type: 'text', value: localStorage.getItem('SealingRequest-specify')},
            SupportingDocument: { type: 'radio', value: localStorage.getItem('SupportingDocument')},
            'SupportingDocument-specify': { type: 'text', value: localStorage.getItem('SupportingDocument-specify')},
            'ReasonsForNameChangeRequest-specify': { type: 'text', value: localStorage.getItem('ReasonsForNameChangeRequest-specify')},





        };

        // Check the contents of fieldsToFill
        console.log('Fields to fill:', fieldsToFill); // Debugging log
        console.log('Age value from localStorage:', localStorage.getItem('Age'));

        // Iterate over the fields and fill them based on their type
        for (const [fieldName, fieldInfo] of Object.entries(fieldsToFill)) {
            console.log(`Injecting value into ${fieldName}: ${fieldInfo.value}`); // Debugging log
            
            let field;
            switch (fieldInfo.type) {
                case 'text':
                    field = this.form.getTextField(fieldName);
                    if (field && fieldInfo.value) {
                        field.setText(fieldInfo.value);
                        console.log(`Filled ${fieldName} with value:`, fieldInfo.value);
                    }
                    break;
                case 'dropdown':
                    field = this.form.getDropdown(fieldName);
                    if (field && fieldInfo.value) {
                        field.select(fieldInfo.value);
                        console.log(`Selected ${fieldName} with value:`, fieldInfo.value);
                    }
                    break;
                case 'checkbox':
                    field = this.form.getCheckBox(fieldName);
                    if (field && fieldInfo.value) {
                        field.check();
                        console.log(`Checked ${fieldName}`);
                    }
                    break;
                case 'radio':
                    field = this.form.getRadioGroup(fieldName);
                    if (field && fieldInfo.value) {
                        // Use consistent Yes/No values for all radio groups
                        const radioValue = fieldInfo.value.toLowerCase() === 'true' ? 'Yes' : 'No';
                        field.select(radioValue);
                        console.log(`Selected ${fieldName} with value:`, radioValue);
                    }
                    break;
            }

            if (!field) {
                console.warn(`Field not found in PDF: ${fieldName}`);
            }
        }

        // Save the modified PDF
        const pdfBytes = await this.pdfDoc.save();
        return pdfBytes;
    }

    logFields() {
        const fields = this.form.getFields();
        fields.forEach(field => {
            console.log(`Field Name: ${field.getName()}, Field Type: ${field.constructor.name}`);
        });
    }
}

// Initialize and scan PDF
console.log('PDF Form Scanner initializing...');
const scanner = new PDFFormScanner();

export default scanner;
