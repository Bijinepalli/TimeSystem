import { DateFormats } from '../model/constants';
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateTimeFormat'
})
export class DateTimeTwoFormatPipe extends DatePipe implements PipeTransform {
    transform(datevalue: any, dateformat: any, dateTimeformat: any): any {
        // tslint:disable-next-line:radix
        // const dt = new Date(parseInt(datevalue.substr(6)));
        // return super.transform(dt, format);
        /* const a = /\/Date\((\d*)\)\//.exec(datevalue);
         if (a) {
             return super.transform(new Date(+a[1]), format);
         }*/
        const dateTime = new Date(datevalue);
        console.log(datevalue);
        console.log(dateTime);
        console.log(dateTime.getHours(), dateTime.getMinutes(), dateTime.getSeconds());
        if ((dateTime.getHours() + dateTime.getMinutes() + dateTime.getSeconds()) > 0) {
            return super.transform(datevalue, dateTimeformat);
        } else {
            return super.transform(datevalue, dateformat);
        }
    }
}
