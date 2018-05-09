import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ThankYouPage } from '../thank-you/thank-you';
import { UsersProvider } from '../../providers/users/users';
import { IssueScreenPage } from '../issue-screen/issue-screen';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';


@IonicPage()
@Component({
  selector: 'page-donate-feed-back',
  templateUrl: 'donate-feed-back.html',
})
export class DonateFeedBackPage {
  isenabled:boolean=false;
  url:any;
  value:any;
  endpoint:any = 'actions';
  data:any = [{
    user_id: '',
    title: '',
    short_desc: '',
    representative_id: '',
    action_type_id: '',
    goal_id: ''
  }]; 
  objectiveID:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private themeableBrowser: ThemeableBrowser,
    private httpProvider: UsersProvider) {
      this.url = navParams.get('iframeUrl');
      this.openWebpage(this.url);
      this.data.goal_id = navParams.get('goalID');
      this.data.representative_id = navParams.get('repID');
      this.data.action_type_id = '500f35fc-9338-4f1d-bdc8-13302afa33e7';
      this.data.title = 'donat';
      this.objectiveID = navParams.get('objectiveID');
      this.httpProvider.returnRallyUserId().then( user => {
        this.data.user_id = user.apiRallyID;
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonateFeedBackPage');
  }

  sendActions($event){
    this.isenabled = true;
    console.log($event);
    
    let clickedElement = $event.target || $event.srcElement;

    if( clickedElement.nodeName === "BUTTON" ) {

      let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
      // if a Button already has Class: .active
      if( isCertainButtonAlreadyActive ) {
        isCertainButtonAlreadyActive.classList.remove("active");
      }

      clickedElement.className += " active";
    }

  }

  streakModal() {
    let modal = this.modalCtrl.create(ThankYouPage);
    modal.onDidDismiss(() => {
      this.navCtrl.popTo(this.navCtrl.getByIndex(0), {animate:true,animation:'transition',duration:500,direction:'back'});
    });
    modal.present();
  }

  openWebpage(url: string) {
    const options = constants.themeAbleOptions;
    const browser = this.themeableBrowser.create(url, '_system', options);

    browser.on("loadstop")
        .subscribe(
        () => {
            browser.insertCss({
                code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
            })
        },
        err => {
            console.log("InAppBrowser Loadstop Event Error: " + err);
        });

      browser.on('closePressed').subscribe(data => {
          browser.close();
      })
  }

  errorModal(){
    let modal = this.modalCtrl.create(IssueScreenPage);
      modal.onDidDismiss((val) => {
          this.navCtrl.popTo(this.navCtrl.getByIndex(0), {animate:true,animation:'transition',duration:500,direction:'back'});
      });
    modal.present();
  }

  getValue(value){
    console.log(value);
    this.value = value;

  }

  addAction(){
    this.httpProvider.addAction(this.endpoint, this.data);
  }

  back(){
    this.navCtrl.pop();
  }

  submit(){
  
    console.log("Value", this.value);
    if(this.value === 'success'){
      this.streakModal();
      this.addAction();
    }else if(this.value === 'fail'){
      this.errorModal();
    }else{
      this.back();
    }
  }

}
