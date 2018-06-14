import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GeneralModalComponent } from './general-modal';

@NgModule({
  declarations: [
      GeneralModalComponent,
  ],
  imports: [
    IonicPageModule.forChild(GeneralModalComponent),
  ],
    exports: [GeneralModalComponent]
})
export class GeneralModalModule {}
