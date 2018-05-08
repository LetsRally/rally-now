import { Component, Input } from '@angular/core';

@Component({
  selector: 'main-button',
  templateUrl: 'main-button.html'
})
export class ButtonComponent {

   @Input() btnText: string;


  constructor() {
    
  }


}
