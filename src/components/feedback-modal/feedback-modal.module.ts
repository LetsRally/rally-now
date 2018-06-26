import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {FeedbackModalComponent} from "./feedback-modal";


@NgModule({
    declarations: [
        FeedbackModalComponent,
    ],
    imports: [
        IonicPageModule.forChild(FeedbackModalComponent),
    ],
    exports: [FeedbackModalComponent]
})
export class FeedbackModalModule {}