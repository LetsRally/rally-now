import {Component} from '@angular/core';
import {IonicPage, NavParams, ViewController} from "ionic-angular";

@IonicPage()
@Component({
    selector: 'modal-window',
    templateUrl: 'modal-window.html'
})
export class ModalWindowComponent {

    public title = '';
    public text = '';
    public buttonsNames = [];

    constructor(
        public viewCtr: ViewController,
        private navParams: NavParams
    ) {}

    closeModal() {
        this.viewCtr.dismiss();
    }

    continueStep() {
        this.viewCtr.dismiss({access: true});
    }

    ionViewDidLoad() {
        this.title = this.navParams.get('title');
        this.text = this.navParams.get('text');
        this.buttonsNames = this.navParams.get('buttonsNames');
    }
}