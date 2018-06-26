import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ViewController,
    ModalController,
    ActionSheetController,
    ToastController
} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {AdressModalPage} from '../adress-modal/adress-modal';
import {UsersProvider} from '../../providers/users/users';
import {FaxFeedBackPage} from '../fax-feed-back/fax-feed-back';
import {EmailFeedBackPage} from '../email-feed-back/email-feed-back';
import {ThanksPage} from '../thanks/thanks';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {CallRepPage} from '../call-rep/call-rep';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import * as constants from "../../constants/constants";
import {ThankYouPage} from "../thank-you/thank-you";
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import {IssueScreenPage} from "../issue-screen/issue-screen";


@IonicPage()
@Component({
    selector: 'page-my-representatives',
    templateUrl: 'my-representatives.html',
})
export class MyRepresentativesPage {

    reps: any;
    senators: any;
    repAddress: any;
    repsEndpoint: any = 'reps?bioguide=';
    data: any = [{
        user_id: '',
        title: '',
        short_desc: '',
        representative_id: '',
        action_type_id: ''
    }];
    favEndpoint: any = 'actions';
    myrallyID: any;
    followEndpoint: any = 'following_representative';
    statereps: any;
    user: any;
    private userEmail = '';
    private userName = '';
    private userPhone = '';


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        private storage: Storage,
        public modalCtrl: ModalController,
        private themeableBrowser: ThemeableBrowser,
        private httpProvider: UsersProvider,
        public actionSheetCtrl: ActionSheetController,
        public toastCtrl: ToastController,
        private shareProvider: SocialShareProvider) {
        this.httpProvider.returnRallyUserId()
            .then(user => {
                console.log(" Usuario", user);
                this.user = user;
                this.myrallyID = user.apiRallyID;
                this.data.user_id = user.apiRallyID;
                this.getAddress();
                this.getReps();
                // this.getStateReps();
                this.getSenators();
            });
        this.storage.get('EMAIL').then((res) => {
            this.userEmail = res;
        });
        this.storage.get('USER_PHONE').then((res) => {
            this.userPhone = res || '';
        });
        this.storage.get('DISPLAYNAME').then((res) => {
            this.userName = res;
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MyRepresentativesPage');
    }

    getReps() {
        this.storage.get('representatives').then((val) => {
            if (val && typeof(val) === 'object') {
                this.reps = val;
                console.log('REPS');
                console.log(this.reps);
            }
        });

    }

    getSenators() {
        this.storage.get('senators').then((val) => {
            if (val) {
                this.senators = val;
                console.log('SENATORS');
                console.log(this.senators);
            }
        });
    }

    getStateReps() {
        this.storage.get('statesReps').then((val) => {
            if (val) {
                this.statereps = val;
            }
        });
    }


    finReps() {
        let modal = this.modalCtrl.create(AdressModalPage);
        modal.onDidDismiss(() => {
            this.getReps();
            this.getSenators();
            // this.getStateReps();
            this.getAddress();
        });
        modal.present();

    }


    getAddress() {
        this.storage.get('repAdress').then((val) => {
            console.log(val);
            if (val) {
                this.repAddress = val;
            } else {
                this.repAddress = "No Address";
            }
        });
    }

    getRepID(rep, fax, twitter, email, bioguide) {
        this.httpProvider.getJsonData(this.repsEndpoint + bioguide).subscribe(result => {
            console.log(result);
            this.data.representative_id = result[0].id;
            this.presentActionSheet(rep, result[0].fax_url, result[0].twitter_id, email, result[0].id, result[0].offices);
        });
    }

    presentActionSheet(rep, fax, twitter, email, repID, offices) {
        let buttonsArray = [{
            text: 'Call',
            handler: () => {
                this.navCtrl.push(CallRepPage, {rep: rep, repID: repID, offices: offices, user: this.user});
            }
        }];


        if (fax) {
            buttonsArray.push(
                {
                    text: 'Fax',
                    handler: () => {
                        let params = {
                            rep: rep,
                            iframeUrl: fax,
                            repID: repID
                        };
                        this.doFax(params);
                    }
                }
            );
        }

        if (email) {
            buttonsArray.push(
                {
                    text: 'Email',
                    handler: () => {
                        let params = {
                            iframeUrl: email,
                            repID: repID,
                            rep: rep
                        };
                        this.doEmail(params);
                    }
                }
            )
        }

        if (twitter) {
            buttonsArray.push(
                {
                    text: 'Post message via Twitter',
                    handler: () => {
                        console.log('Post message via Twitter clicked');

                        this.shareProvider.twitterShare('@' + twitter).then(() => {
                            this.data.title = 'tweet';
                            this.data.action_type_id = '9eef1652-ccf9-449a-901e-ad6c0b3a8a6c';
                            this.httpProvider.addAction(this.favEndpoint, this.data);
                            this.streakModal();
                        });
                    }
                }
            )
        }


        buttonsArray[buttonsArray.length] = {
            text: 'Cancel',
            // role: 'cancel',
            handler: () => {
                console.log('Cancel clicked');
            }
        };

        let actionSheet = this.actionSheetCtrl.create({
            title: 'Contact ' + rep.name,
            buttons: buttonsArray
        });
        actionSheet.present();
    }

    doEmail(params) {
        const options = constants.themeAbleOptions;
        const browser = this.themeableBrowser.create(params.iframeUrl, '_blank', options);

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
            this.emailFeedback(params);
        })
    }

    emailFeedback(params) {
        let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackEmailRows});
        modal.onDidDismiss((data) => {
            switch (data.actionId) {
                case 1: {
                    this.streakEmailModal(params);
                    this.addEmailAction(params);
                }
                    break;

                case 2: {
                    this.errorModal();
                }
            }
        });
        modal.present();
    }

    streakEmailModal(params) {
        let data = {
            titleForShare: `I used Rally to email ${params.rep.title} ${params.rep.first_name} ${params.rep.last_name}`,
            imgURI: params.rep.photo_url
        };

        let modal = this.modalCtrl.create(ThankYouPage, data);
        modal.present();
    }

    addEmailAction(params) {
        let data = {
            representative_id: params.repID,
            goal_id: 'contact',
            action_type_id: 'f9b53bc8-9847-4699-b897-521d8e1a34bb',
            title: 'email',
            user_id: this.myrallyID
        };
        this.httpProvider.addAction('actions', data);
    }

    doFax(params) {
        const options = constants.themeAbleOptions;
        const that = this;
        const browser = this.themeableBrowser.create(params.iframeUrl, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.insertCss({
                        code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
                    });

                    if (params.iframeUrl.indexOf('https://faxzero.com/') !== -1) {
                        browser.executeScript({
                            code: 'document.getElementById("input-fax_s_name").value = "' + that.userName + '";' +
                            ' document.getElementById("input-fax_s_email").value = "' + that.userEmail + '";' +
                            ' document.getElementById("input-fax_s_phone").value = "' + that.userPhone + '";' +
                            ' document.body.style.paddingTop = "50px"'
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
            this.faxFeedback(params);
        })
    }

    faxFeedback(params) {
        let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackFaxRows});
        modal.onDidDismiss((data) => {
            switch (data.actionId) {
                case 1: {
                    this.streakFaxModal(params);
                    this.addAction(params);
                }
                    break;

                case 2: {
                    this.errorModal();
                }
            }
        });
        modal.present();
    }

    streakFaxModal(params) {
        let data = {
            titleForShare: `I used Rally to fax ${params.rep.title} ${params.rep.first_name} ${params.rep.last_name}`,
            imgURI: params.rep.photo_url
        };

        let modal = this.modalCtrl.create(ThankYouPage, data);
        modal.present();
    }

    addAction(params) {
        let data = {
            representative_id: params.repID,
            goal_id: 'contact',
            action_type_id: 'ad3ef19b-d809-45b7-bef2-d470c9af0d1d',
            title: 'fax',
            user_id: this.myrallyID
        };
        this.httpProvider.addAction('actions', data);
    }

    errorModal() {
        let modal = this.modalCtrl.create(IssueScreenPage);
        modal.onDidDismiss((val) => {
            let params = {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'back'
            };

            if (!val || !val.close) {
                this.navCtrl.popTo(this.navCtrl.getByIndex(0), params);
                this.navCtrl.parent.select(0);
                this.navCtrl.parent.goToRoot();
            }
        });
        modal.present();
    }

    streakModal() {
        let modal = this.modalCtrl.create(ThanksPage);
        modal.present();
    }


    getRepStatus(bioguide, $event, name) {
        this.httpProvider.getJsonData(this.repsEndpoint + bioguide).subscribe(result => {
            this.followRep(result[0].id, $event, name);
        });
    }

    getID(bioguide) {
        this.httpProvider.getJsonData(this.repsEndpoint + bioguide).subscribe(result => {
            console.log(result);
            this.goToRepProfile(result[0].id,);
        });
    }


    followRep(repID, $event, name) {
        this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.myrallyID + '&representative_id=' + repID)
            .subscribe(
                result => {
                    if (result != "") {
                        this.unFollowRep(result[0].id, name, $event);
                    } else {
                        this.saveRepInApi(repID);
                        $event.srcElement.innerHTML = "Following";
                        $event.srcElement.innerText = "FOLLOWING";
                        $event.srcElement.classList.add('following');
                    }
                },
                err => {
                    console.error("Error : " + err);
                },
                () => {
                    console.log('getData completed');
                }
            );
    }

    saveRepInApi(repID) {
        this.httpProvider.followRep(this.followEndpoint, this.myrallyID, repID);
    }


    unFollowRep(recordID, name, $event) {
        let actionSheet = this.actionSheetCtrl.create({
            title: `Unfollow ${name}?`,
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        $event.srcElement.innerHTML = "Follow";
                        $event.srcElement.innerText = "FOLLOW";
                        $event.srcElement.classList.remove('following');
                        this.httpProvider.unfollowOrganization(this.followEndpoint, recordID);
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    transform(value: any) {
        if (value) {
            return value.toUpperCase();
        }
        return value;
    }

    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

}
