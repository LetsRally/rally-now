import { Component } from '@angular/core';
import {IonicPage, NavParams, ViewController} from "ionic-angular";

@IonicPage()
@Component({
  selector: 'modal-photo-viewer',
  templateUrl: 'modal-photo-viewer.html'
})
export class ModalPhotoViewerComponent {

  public srcImage = '';
  public userName = '';

  constructor(public viewCtr: ViewController,
              private navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.srcImage = this.navParams.get('src');
    this.userName = this.navParams.get('userName');
  }

  closemodal() {
    this.viewCtr.dismiss();
  }

}
