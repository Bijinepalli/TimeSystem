import { DateFormats } from '../model/constants';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat'
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {
    transform(datevalue: any, format: any): any {
        return super.transform(datevalue, format);
    }
}
