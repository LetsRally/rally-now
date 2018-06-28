import {Pipe, PipeTransform} from '@angular/core';


@Pipe({
    name: 'dateTransform',
})
export class DateTransformPipe implements PipeTransform {

    transform(value: string, endDateValue) {
        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let date = new Date(value);
        let transformedDate = month[date.getMonth()] + ' ' + date.getDate();
        let transformedEndDate;
        if (endDateValue) {
            let endDate = new Date(endDateValue);
            transformedEndDate = month[endDate.getMonth()] + ' ' + endDate.getDate();
        }

        if(transformedDate !== transformedEndDate) {
            return transformedDate + ' - ' + transformedEndDate;
        }

        return transformedDate;
    }
}
