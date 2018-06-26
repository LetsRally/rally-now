import {Component} from '@angular/core';
import {IonicPage, NavParams, ViewController} from "ionic-angular";

@IonicPage()
@Component({
    selector: 'feedback-modal',
    templateUrl: 'feedback-modal.html'
})
export class FeedbackModalComponent {

    public rows = [];

    constructor(public viewCtr: ViewController,
                private navParams: NavParams) {
    }

    continueStep(id) {
        this.viewCtr.dismiss({actionId: id});
    }

    ionViewDidLoad() {
        this.rows = this.navParams.get('rows');
    }

}
