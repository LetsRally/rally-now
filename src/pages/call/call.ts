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
    selector: 'page-call',
    templateUrl: 'call.html',
})
export class CallPage {
    rep: any;
    user: any;
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

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        public actionSheetCtrl: ActionSheetController,
        private callNumber: CallNumber,
        private httpProvider: UsersProvider,
        private storage: Storage,
        public viewCtrl: ViewController,
        private alertCtrl: AlertController) {
        console.log("offices", navParams.get('offices'));
        this.offices = navParams.get('offices');
        this.rep = navParams.get('rep');
        this.data.representative_id = navParams.get('repID');
        this.data.goal_id = navParams.get('goalID');
        this.objetiveID = navParams.get('objectiveID');
        this.data.action_type_id = '2afa6869-7ee5-436e-80a9-4fee7c871212';
        this.data.title = 'call';
        this.httpProvider.returnRallyUserId().then(user => {
            this.data.user_id = user.apiRallyID;
            this.user = user;
            this.parseTalkingPoints();
        });
        this.isRep = this.rep.title && this.rep.title.indexOf('representative') !== -1;
        this.isSen = this.rep.rep_type && this.rep.rep_type === 'sen';
        this.showCallAlert(this.rep.phone);

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

    parseTalkingPoints() {
        let tempText = this.navParams.get('talkingPoints');
        tempText = tempText.split('{user.first_name}').join(this.user.displayName);
        tempText = tempText.split('{user.address_city}').join(this.user.address);
        tempText = tempText.split('{rep.title}').join(this.rep.title);
        tempText = tempText.split('{rep.last_name}').join(this.rep.last_name);
        this.talkingPoints = tempText;
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
                    // console.log("Phone Number", this.offices);
                    // console.log("Iterator", office.phone);
                    this.makeCall(phone);

                }
            });
        });

        actionSheet.addButton({text: 'Cancel', 'role': 'cancel'});

        actionSheet.present();
    }

    giveFeedBack() {
        let data = {
            titleForShare: `I used Rally to call ${this.rep.title} ${this.rep.first_name} ${this.rep.last_name}`,
            imgURI: this.rep.photo_url
        };
        this.navCtrl.push(FeedbackPage, data, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
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
                        console.log('Cancel clicked');
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
