import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {ModalPhotoViewerComponent} from "./modal-photo-viewer";

@NgModule({
    declarations: [
        ModalPhotoViewerComponent,
    ],
    imports: [
        IonicPageModule.forChild(ModalPhotoViewerComponent),
    ],
    exports: [ModalPhotoViewerComponent]
})
export class ModalPhotoViewerModule {}