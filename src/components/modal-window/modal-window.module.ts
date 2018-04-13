import {NgModule} from '@angular/core';
import {ModalWindowComponent} from "./modal-window";
import {IonicPageModule} from "ionic-angular";

@NgModule({
    declarations: [
        ModalWindowComponent
    ],
    imports: [
        IonicPageModule.forChild(ModalWindowComponent)
    ],
    exports: [
        ModalWindowComponent
    ],
    providers: []
})
export class ModalWindowModule {
}