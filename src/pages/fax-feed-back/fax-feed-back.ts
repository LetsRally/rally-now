import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {ThankYouPage} from '../thank-you/thank-you';
import {UsersProvider} from '../../providers/users/users';
import {IssueScreenPage} from '../issue-screen/issue-screen';
import {Storage} from '@ionic/storage';
import {ViewController} from 'ionic-angular/navigation/view-controller';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';

@IonicPage()
@Component({
    selector: 'page-fax-feed-back',
    templateUrl: 'fax-feed-back.html',
})
export class FaxFeedBackPage {
    isenabled: boolean = false;
    url: any;
    value: any;
    endpoint: any = 'actions';
    data: any = [{
        user_id: '',
        title: '',
        short_desc: '',
        representative_id: '',
        action_type_id: '',
        goal_id: ''
    }];
    objectiveID: any;
    private userEmail = '';
    private userName = '';
    private userPhone = '';


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        private storage: Storage,
        private themeableBrowser: ThemeableBrowser,
        private httpProvider: UsersProvider,
        public viewCtrl: ViewController) {
        this.url = navParams.get('iframeUrl');
        this.data.representative_id = navParams.get('repID');
        this.data.goal_id = navParams.get('goalID');
        this.data.action_type_id = 'ad3ef19b-d809-45b7-bef2-d470c9af0d1d';
        this.data.title = 'fax';
        this.objectiveID = navParams.get('objectiveID');
        this.httpProvider.returnRallyUserId().then(user => {
            this.data.user_id = user.apiRallyID;
            this.storage.get('EMAIL').then((res) => {
                this.userEmail = res;
            });
            this.storage.get('USER_PHONE').then((res) => {
                this.userPhone = res;
            });
            this.storage.get('DISPLAYNAME').then((res) => {
                this.userName = res;
                this.openWebpage(this.url);
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FaxFeedBackPage');
    }

    openWebpage(url: string) {
        const options = constants.themeAbleOptions;
        let that = this;
        const browser = this.themeableBrowser.create(url, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.insertCss({
                        code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
                    })

                    if (url.indexOf('https://faxzero.com/') !== -1) {
                        browser.executeScript({
                            code: 'document.getElementById("input-fax_s_name").value = "' + that.userName + '";' +
                            ' document.getElementById("input-fax_s_email").value = "' + that.userEmail + '";' +
                            ' document.getElementById("input-fax_s_phone").value = "' + that.userPhone + '";'
                        }).then((r) => {
                        }).catch((err) => {
                            console.log('EXECUTE ERROR');
                            console.log(err);
                        })
                    }
                },
                err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                });

        browser.on('closePressed').subscribe(data => {
            browser.close();
        })
    }

    sendActions($event) {
        this.isenabled = true;
        console.log($event);

        let clickedElement = $event.target || $event.srcElement;

        if (clickedElement.nodeName === "BUTTON") {

            let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
            // if a Button already has Class: .active
            if (isCertainButtonAlreadyActive) {
                isCertainButtonAlreadyActive.classList.remove("active");
            }

            clickedElement.className += " active";
        }

    }

    streakModal() {
        let modal = this.modalCtrl.create(ThankYouPage);
        modal.present();
    }

    errorModal() {
        let modal = this.modalCtrl.create(IssueScreenPage);
        modal.onDidDismiss((val) => {
            this.navCtrl.popTo(this.navCtrl.getByIndex(1), {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'back'
            });
        });
        modal.present();
    }

    getValue(value) {
        console.log(value);
        this.value = value;

    }

    addAction() {
        this.httpProvider.addAction(this.endpoint, this.data);
    }

    back() {

        this.navCtrl.pop();

    }


    submit() {

        console.log("Value", this.value);
        if (this.value === 'success') {
            this.streakModal();
            this.addAction();
        } else if (this.value === 'fail') {
            this.errorModal();
        } else {
            this.back();
        }
    }

}
