import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'dateTransform',
})
export class DateTransformPipe implements PipeTransform {

  transform(value: string, ...args) {
    let date = new Date(value);
    let transformedDate = date.getDate() + ' ' + date.getMonth();
    return transformedDate;
  }
}
