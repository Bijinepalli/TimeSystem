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
    public static validateEqualConfirmPassword(control: FormControl): ValidationResult {
        const comparewith = control.root.get('confirmpassword');
        if (control && comparewith) {
            if (control.value !== comparewith.value) {
                return { validateEqualConfirmPassword: true };
            } else {
                if (comparewith.errors !== null && comparewith.errors['validateEqualPassword'] !== null) {
                    delete comparewith.errors['validateEqualPassword'];
                    if (!Object.keys(comparewith.errors).length) {
                        comparewith.setErrors(null);
                    }
                }
                if (control.errors !== null && control.errors['validateEqualConfirmPassword'] !== null) {
                    delete control.errors['validateEqualConfirmPassword'];
                    if (!Object.keys(control.errors).length) {
                        control.setErrors(null);
                    }
                }
            }
        }
        return null;
    }
    public static validateEqualPassword(control: FormControl): ValidationResult {
        const comparewith = control.root.get('password');
        if (control && comparewith) {
            if (control.value !== comparewith.value) {
                return { validateEqualPassword: true };
            } else {
                if (comparewith.errors !== null && comparewith.errors['validateEqualConfirmPassword'] !== null) {
                    delete comparewith.errors['validateEqualConfirmPassword'];
                    if (!Object.keys(comparewith.errors).length) {
                        comparewith.setErrors(null);
                    }
                }
                if (control.errors !== null && control.errors['validateEqualPassword'] !== null) {
                    delete control.errors['validateEqualPassword'];
                    if (!Object.keys(control.errors).length) {
                        control.setErrors(null);
                    }
                }
            }
        }
        return null;
    }
}

