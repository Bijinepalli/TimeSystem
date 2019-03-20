import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';


@Injectable()
export class ValidatorHelper {

    static required(control: AbstractControl): { [key: string]: boolean } {
        const v: string = control.value ? control.value : '';
        return v.trim().length > 0 ? null : { 'required': true };
    }


    // This is the guts of Angulars minLength, added a trim for the validation
    static minLength(minLength: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (ValidatorHelper.isPresent(Validators.required(control))) {
                return null;
            }
            const v: string = control.value ? control.value : '';
            return v.trim().length < minLength ?
                { 'minlength': { 'requiredLength': minLength, 'actualLength': v.trim().length } } :
                null;
        };
    }

    static maxLength(maxLength: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const length: number = control.value ? control.value.trim().length : 0;
            return length > maxLength ?
                { 'maxlength': { 'requiredLength': maxLength, 'actualLength': length } } :
                null;
        };
    }

    static isPresent(obj: any): boolean {
        return obj !== undefined && obj !== null;
    }


}
