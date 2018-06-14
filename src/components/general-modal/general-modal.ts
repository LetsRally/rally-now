import { Component } from '@angular/core';
import {IonicPage, NavParams, ViewController} from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'general-modal',
  templateUrl: 'general-modal.html',
})
export class GeneralModalComponent {

    public title = '';
    public subTitle = '';
    public rows = [];
    public buttonName = '';

    constructor(
        public viewCtr: ViewController,
        private navParams: NavParams
    ) {}

    accept() {
        this.viewCtr.dismiss({accepted: true});
    }

    continueStep(id?) {
        if(id) {
            this.viewCtr.dismiss({actionId: id});
        }
        else {
            this.viewCtr.dismiss();
        }
    }

    ionViewDidLoad() {
        this.title = this.navParams.get('title');
        this.subTitle = this.navParams.get('subTitle');
        this.rows = this.navParams.get('rows');
        this.buttonName = this.navParams.get('buttonName');
    }

}
