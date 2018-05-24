import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, App, ActionSheetController} from 'ionic-angular';
import {UsersProvider} from '../../providers/users/users';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import * as constants from '../../constants/constants';


@IonicPage()
@Component({
    selector: 'page-thank-you',
    templateUrl: 'thank-you.html',
})
export class ThankYouPage {

    currentRallyID: any;
    streaksEndpoint: any = 'actions?user_id=';
    streaks: any;
    starCount: number = 0;
    replacedDate: any = '';
    public starArray: any[] = [];
    endpoint: any = 'users/';
    username: any;
    weekInMiliseconds: number = 604800000;
    weekStreaks: any;
    countWeek: number = 0;
    accountStatus: any;
    private titleForShare: string;
    private imgURI: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        private httpProvider: UsersProvider,
        private app: App,
        public actionSheetCtrl: ActionSheetController,
        private shareProvider: SocialShareProvider) {
        this.httpProvider.returnRallyUserId().then(user => {
            this.currentRallyID = user.apiRallyID;
            this.getStreaks();
            this.getUsername();
            this.getStreaksPerWeek();
        });
        this.titleForShare = navParams.get('titleForShare');
        this.imgURI = navParams.get('imgURI');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ThankYouPage');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    getUsername() {
        this.httpProvider.getJsonData(this.endpoint + this.currentRallyID).subscribe(result => {
            let nickname = result.name.split(" ");
            console.log(result);
            this.username = nickname[0];
            this.accountStatus = result.hide_activity;
        });
    }

    getStreaks() {
        this.httpProvider.getJsonData(this.streaksEndpoint + this.currentRallyID)
            .subscribe(result => {
                console.log("Racha", result.length, result);
                this.streaks = result.reverse();

                console.log("From variable", this.streaks.length);
                for (let i = 0; i < this.streaks.length; i++) {
                    let cuttedStreak = this.streaks[i].created_at.split('T');
                    let date = cuttedStreak[0];
                    date = date.split('-');
                    let newDate = date[1] + "/" + date[2] + "/" + date[0];
                    let timestampDate = new Date(newDate).getTime();

                    console.log(this.replacedDate);
                    if (this.replacedDate != "") {
                        if (timestampDate < this.replacedDate) {
                            let difference = this.replacedDate - timestampDate;
                            let ms = difference / 1000;
                            let seconds = ms % 60;
                            ms /= 60;
                            let minutes = ms % 60;
                            ms /= 60;
                            let hours = ms % 24;
                            ms /= 24;
                            let days = ms;
                            this.replacedDate = timestampDate;

                            if (days <= 1) {
                                if (days != 0) {
                                    this.starCount++;
                                    this.starArray.push({days: days});
                                }
                            }

                        }

                    } else {
                        this.replacedDate = timestampDate;
                    }

                }


            });
    }


    getStreaksPerWeek() {
        this.httpProvider.getJsonData(this.streaksEndpoint + this.currentRallyID).subscribe(result => {
            this.weekStreaks = result.reverse();
            this.calcWeekly();
        });
    }

    calcWeekly() {

        var todayDate = new Date();
        var todayInMiliseconds = todayDate.getTime();
        console.log(todayInMiliseconds);

        for (let i = 0; i < this.weekStreaks.length; i++) {
            let originalDate = this.weekStreaks[i].created_at.split('T');
            let splittedDate = originalDate[0];
            splittedDate = splittedDate.split('-');
            let newDate = splittedDate[1] + "/" + splittedDate[2] + "/" + splittedDate[0];
            let dateInMilisenconds = new Date(newDate).getTime();
            console.log(dateInMilisenconds);

            if ((todayInMiliseconds - dateInMilisenconds) <= this.weekInMiliseconds) {
                console.log("In this week, YUY!");
                this.countWeek++;
            }
        }
    }


    shareController() {
        this.shareProvider.otherShare(this.titleForShare, 'MESSAGE---', this.imgURI, constants.appStoreUrl)
            .then(() => {
                console.log('SHARED');
            }, err => {
                console.log(err);
            })
    }


}
