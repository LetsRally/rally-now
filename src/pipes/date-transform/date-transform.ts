import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'dateTransform',
})
export class DateTransformPipe implements PipeTransform {

  transform(value: string, ...args) {
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let date = new Date(value);
    let transformedDate = date.getDate() + ' ' + month[date.getMonth()];
    return transformedDate;
  }
}
