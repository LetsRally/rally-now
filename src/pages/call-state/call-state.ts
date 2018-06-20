import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ActionSheetController,
    ViewController,
    AlertController
} from 'ionic-angular';
import {AlertsPage} from '../alerts/alerts'
import {ProfilePage} from '../profile/profile'
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {FeedPage} from '../feed/feed';
import {FeedbackPage} from '../feedback/feedback';
import {CallNumber} from '@ionic-native/call-number';
import {UsersProvider} from '../../providers/users/users';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
    selector: 'page-call-state',
    templateUrl: 'call-state.html',
})
export class CallStatePage {
    rep: any;
    endpoint: any = 'actions';
    callButtonText: any = 'Call';
    data: any = [{
        user_id: '',
        title: '',
        short_desc: '',
        representative_id: '',
        action_type_id: '',
        goal_id: ''
    }];
    talkingPoints: any;
    offices: any;
    objetiveID: any;
    phoneArr = [];
    isNotYourRep: boolean = true;
    isRep: any;
    isSen: any;
    user = {
        displayName: ''
    };
    private parentView = undefined;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        public popoverCtrl: PopoverController,
        public actionSheetCtrl: ActionSheetController,
        private callNumber: CallNumber,
        private httpProvider: UsersProvider,
        public viewCtrl: ViewController,
        private alertCtrl: AlertController) {
        this.parentView = navParams.get('parentView');
        this.offices = navParams.get('offices');
        this.rep = navParams.get('rep');
        this.talkingPoints = navParams.get('talkingPoints');
        this.data.representative_id = navParams.get('repID');
        this.data.goal_id = navParams.get('goalID');
        this.objetiveID = navParams.get('objectiveID');
        this.data.action_type_id = '2afa6869-7ee5-436e-80a9-4fee7c871212';
        this.data.title = 'call';
        this.isRep = this.rep.title && this.rep.title.indexOf('representative') !== -1;
        this.isSen = this.rep.rep_type && this.rep.rep_type === 'sen';
        this.httpProvider.returnRallyUserId().then(user => {
            this.data.user_id = user.apiRallyID;
            this.user = user;
        });
        this.showCallAlert(this.rep.offices[0].phone);

        this.setPhonesArray(this.offices);
        this.getYourRepsAndSen();
    }

    getYourRepsAndSen() {
        this.storage.get('representatives').then((reps) => {
            this.storage.get('senators').then((sens) => {
                if(reps && reps.length) {
                    reps.map((el) => {
                        if(el['bioguide'] === this.rep['bioguide']) {
                            this.isNotYourRep = false;
                            this.isRep = true;
                        }
                    })
                }

                if(sens && sens.length) {
                    sens.map((el) => {
                        if(el['bioguide'] === this.rep['bioguide']) {
                            this.isNotYourRep = false;
                            this.isSen = true;
                        }
                    })
                }
            })
        })
    }

    setPhonesArray(arr) {
        arr.map((elem) => {
            let hasElem = this.phoneArr.indexOf(elem.phone);
            if (elem.phone !== '' && hasElem === -1) {
                this.phoneArr.push(elem.phone);
            }
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CallPage');
    }

    presentPopover() {
        let popover = this.popoverCtrl.create(OverlayPage);
        popover.present();
    }

    goToHome() {
        this.navCtrl.setRoot(FeedPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToAlerts() {
        this.navCtrl.setRoot(AlertsPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToProfile() {
        this.navCtrl.setRoot(ProfilePage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    callOffices() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select a different office',
        });

        this.phoneArr.forEach(phone => {
            actionSheet.addButton({
                text: phone,
                handler: () => {
                    console.log("Phone Number", this.offices);
                    console.log("Iterator", phone);
                    this.makeCall(phone);

                }
            });
        });
        actionSheet.addButton({text: 'Cancel', 'role': 'cancel'});

        actionSheet.present();
    }

    giveFeedBack() {
        this.navCtrl.push(FeedbackPage, {
            repID: this.data.representative_id,
            goalID: this.data.goal_id,
            objectiveID: this.objetiveID,
            parentView: this.parentView
        }, {animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'});
    }

    showCallAlert(phone_number) {
        let alert = this.alertCtrl.create({
            title: 'Are you ready?',
            message: "If you're not sure what to say, you can review the suggested script with talking points before making the call.",
            buttons: [
                {
                    text: 'Review script',
                    role: 'cancel',
                    handler: () => {
                        this.callButtonText = "Call Again";
                    }
                },
                {
                    text: 'Make the Call',
                    handler: () => {
                        this.makeCall(phone_number);
                        this.callButtonText = "Call Again";

                    }
                }
            ]
        });
        alert.present();
    }

    makeCall(phone_number) {

        console.log(phone_number);
        this.callNumber.callNumber(phone_number, true)
            .then(() => console.log('Launched dialer!'))
            .catch(() => console.log('Error launching dialer'));
    }

    transform(value: any) {
        if (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    }


}
