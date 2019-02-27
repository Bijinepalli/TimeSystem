import { DateFormats } from '../model/constants';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat'
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {
    transform(datevalue: any, format: any): any {
        // tslint:disable-next-line:radix
        const dt = new Date(parseInt(datevalue.substr(6)));
        return super.transform(dt, format);
       /* const a = /\/Date\((\d*)\)\//.exec(datevalue);
        if (a) {
            return super.transform(new Date(+a[1]), format);
        }*/
    }
}
