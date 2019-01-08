import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
    transform(timS: string): any {
        let tim: number;
        tim = + timS;
        if (tim === 0) {
            return '00:00';
        }
        const h = Math.floor(tim / 60);
        const m = tim % 60;

        // return ((h + ' hr ') + ((m > 0) ? (m + ' min') : ''));
        return (((h < 10 && h > 0) ? ('0' + h) : h) + ((m > 0) ? (':' + ((m < 10) ? ('0' + m) : m)) : ''));
    }
}
