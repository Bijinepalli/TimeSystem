import { FormControl } from '@angular/forms';

export interface ValidationResult {
    [key: string]: boolean;
}

export class PasswordValidator {
    public static strong(control: FormControl): ValidationResult {
        if (control.value !== '') {

            const hasNumber = /\d/.test(control.value);
            const hasUpper = /[A-Z]/.test(control.value);
            const hasLower = /[a-z]/.test(control.value);
            const hasSymbol = /[~!@#$%^&*()_]/.test(control.value);

            // console.log('Num, Upp, Low', hasNumber, hasUpper, hasLower);

            let cnt = 0;
            if (hasNumber) {
                cnt++;
            }
            if (hasUpper) {
                cnt++;
            }
            if (hasLower) {
                cnt++;
            }
            if (hasSymbol) {
                cnt++;
            }
            if (cnt < 3) {
                return { 'strong': true };
            }
        }
        return null;
    }
}
