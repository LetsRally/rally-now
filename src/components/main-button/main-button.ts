import { Component, Input } from '@angular/core';

/**
 * Generated class for the ButtonComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'main-button',
  templateUrl: 'main-button.html'
})
export class ButtonComponent {

   @Input() btnText: string;


  constructor() {
    
  }


}
