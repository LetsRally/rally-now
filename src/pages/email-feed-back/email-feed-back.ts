import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {ThankYouPage} from '../thank-you/thank-you';
import {UsersProvider} from '../../providers/users/users';
import {IssueScreenPage} from '../issue-screen/issue-screen';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';


@IonicPage()
@Component({
    selector: 'page-email-feed-back',
    templateUrl: 'email-feed-back.html',
})
export class EmailFeedBackPage {
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
    private rep: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        private themeableBrowser: ThemeableBrowser,
        private httpProvider: UsersProvider) {

        this.url = navParams.get('iframeUrl');
        this.openWebpage(this.url);
        this.data.representative_id = navParams.get('repID');
        this.data.goal_id = navParams.get('goalID');
        this.rep = navParams.get('rep');
        this.objectiveID = navParams.get('objectiveID');
        this.data.action_type_id = 'f9b53bc8-9847-4699-b897-521d8e1a34bb';
        this.data.title = 'email';
        this.httpProvider.returnRallyUserId().then(user => {
            this.data.user_id = user.apiRallyID;
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EmailFeedBackPage');
    }

    openWebpage(url: string) {
        const options = constants.themeAbleOptions;
        const browser = this.themeableBrowser.create(url, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.executeScript({
                        code: 'document.body.style.paddingTop = "50px"'
                    })
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
        let data = {
            titleForShare: `I used Rally to email ${this.rep.title} ${this.rep.first_name} ${this.rep.last_name}`,
            imgURI: this.rep.photo_url
        };

        let modal = this.modalCtrl.create(ThankYouPage, data);
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
