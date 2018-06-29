import {Component} from '@angular/core';
import {NavController, ModalController, ToastController, ActionSheetController} from 'ionic-angular';
import {SettingsPage} from '../settings/settings';
import {FriendsRequestPage} from '../friends-request/friends-request';
import {StreaksHistoryPage} from '../streaks-history/streaks-history';
import {FollowedOrganizationsPage} from '../followed-organizations/followed-organizations';
import {FollowedCandidatesPage} from '../followed-candidates/followed-candidates';
import {EditProfilePage} from '../edit-profile/edit-profile';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {UserData} from '../../providers/user-data';
import {AngularFireDatabase} from 'angularfire2/database/database';
import {UsersProvider} from '../../providers/users/users';
import {MyFriendsPage} from '../my-friends/my-friends';
import {RepresentivesListPage} from '../representives-list/representives-list';
import {AdressModalPage} from '../adress-modal/adress-modal';
import {MyRepresentativesPage} from '../my-representatives/my-representatives';
import {Storage} from '@ionic/storage';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {OrganizationActionPage} from '../organization-action/organization-action';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import {Facebook} from '@ionic-native/facebook';
import * as constants from "../../constants/constants";
import {ThemeableBrowser, ThemeableBrowserObject} from "@ionic-native/themeable-browser";
import {IssueScreenPage} from "../issue-screen/issue-screen";
import {ThankYouPage} from "../thank-you/thank-you";

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})

export class ProfilePage {

    profileURL: any;
    endpoint: any = 'users';
    name: string;
    location: string;
    description: string;
    currentRallyID: any;
    streaksEndpoint: any = 'actions?user_id=';
    streaks: any;
    actions_taken: any;
    shares: any;
    starCount: number = 0;
    replacedDate: any = '';
    public starArray: any[] = [];
    public buttonClicked: boolean = false; //Whatever you want to initialise it as
    firsToggleIcon: any = "ios-arrow-down";
    secondToggleBtn: boolean = true;
    actions: any;
    longest_streak: any;
    streakToShow: any;
    user = {
        displayName: '',
        photoURL: '',
        location: '',
        description: '',
        actions_taken: '',
        shares: '',
        friends_count: '',
        followers_count: '',
        organizations_count: '',
        my_activity: '',
        username: '',
        id: ''
    };
    myRallyID: any;
    disable: boolean = false;
    likeendpoint: any = 'likes';
    activityLike: any = 'd32c1cb5-b076-4353-ad9c-1c8f81d812e3';
    objectiveActions: any;
    favEndpoint: any = 'actions';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    public records: any = [];


    constructor(
        public navCtrl: NavController,
        public popoverCtrl: PopoverController,
        public userData: UserData,
        public af: AngularFireDatabase,
        private httpProvider: UsersProvider,
        private themeAbleBrowser: ThemeableBrowser,
        public modalCtrl: ModalController,
        private storage: Storage,
        public toastCtrl: ToastController,
        public actionSheetCtrl: ActionSheetController,
        private shareProvider: SocialShareProvider,
        private facebook: Facebook
    ) {
    }


    ionViewWillEnter() {
        this.records = [];
        this.httpProvider.returnRallyUserId().then(user => {
            this.currentRallyID = user.apiRallyID;
            this.getUserData();
            this.getStreaks();
            this.getLongest();
        });
    }


    public onButtonClick() {

        this.buttonClicked = !this.buttonClicked;
        this.firsToggleIcon = 'ios-arrow-up';
    }

    onToggleSecond() {
        this.secondToggleBtn = !this.secondToggleBtn;
    }

    getUserData() {
        this.httpProvider.getJsonData(this.endpoint + '?id=' + this.currentRallyID)
            .subscribe(
                result => {
                    this.user.displayName = result[0].name;
                    this.user.photoURL = result[0].photo_url;
                    this.user.location = result[0].country;
                    this.user.description = result[0].description;
                    this.user.actions_taken = result[0].actions_taken;
                    this.user.shares = result[0].shares;
                    this.user.friends_count = result[0].friends_count;
                    this.user.followers_count = result[0].followers_count;
                    this.user.organizations_count = result[0].following_count;
                    this.user.my_activity = result[0].my_actions;
                    this.actions = result[0].actions;
                    this.longest_streak = result[0].longest_streak;
                    this.user.username = result[0].username;
                    this.user.id = result[0].id;
                    this.getArray(result[0].Objectives_Actions);
                    this.getArray(result[0].Direct_Actions);
                    this.getArray(result[0].Contact_Actions);
                    this.facebook.api('me?fields=picture.width(900)', ['public_profile']).then(data => {
                        this.user.photoURL = data.picture.data.url;
                    });
                }
            );
    }

    sortArray(array) {
        array.sort(function (a, b) {
            var dateA: any = new Date(a.created_at), dateB: any = new Date(b.created_at);
            return dateB - dateA;
        });
    }

    getArray(array) {
        for (let person of array) {
            this.records.push(person);
            this.sortArray(this.records);
        }

    }


    goToSettings() {
        this.navCtrl.push(SettingsPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToRequests() {
        this.navCtrl.push(FriendsRequestPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToReps() {
        this.navCtrl.push(RepresentivesListPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToStreaks() {
        this.navCtrl.push(StreaksHistoryPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToFollowedOrganizations() {
        this.navCtrl.push(FollowedOrganizationsPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToFollowedCandidates() {
        this.navCtrl.push(FollowedCandidatesPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToEditProfile() {
        this.navCtrl.push(EditProfilePage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
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

    presentPopover() {
        let popover = this.popoverCtrl.create(OverlayPage);
        popover.present();
    }

    goToMyFriends() {
        this.navCtrl.push(MyFriendsPage, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    showPhotoViewer() {
        let modal = this.modalCtrl.create('ModalPhotoViewerComponent', {
            src: this.user.photoURL,
            userName: this.user.displayName
        });
        modal.present();
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

    finReps() {
        let modal = this.modalCtrl.create(AdressModalPage);
        modal.onDidDismiss((data) => {
            if (data && data.cancel) {
                return;
            }
            this.goToMyReps();
        });
        modal.present();
    }

    getReps() {
        this.storage.get('representatives').then((val) => {
            console.log(val);
            if (val != null) {
                this.goToMyReps();
            } else {
                this.finReps();
            }
        });
    }

    goToMyReps() {
        this.navCtrl.push(MyRepresentativesPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    getLongest() {
        if (this.starArray.length > this.longest_streak) {
            console.log(this.longest_streak);

            this.updateStreak(this.starArray.length);
            this.streakToShow = this.starArray.length;
        } else {
            this.streakToShow = this.longest_streak;

        }
    }

    updateStreak(value) {
        this.httpProvider.updateSingleItem(this.endpoint + '/' + this.currentRallyID, JSON.stringify({longest_streak: value}));
    }

    getLikeStatus($event, reference_id, like_type, likes) {
        this.disable = true;

        this.httpProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.user.id).subscribe(
            result => {
                console.log($event);
                console.log("Aqui", $event.srcElement.lastChild.data);

                if (result != "") {
                    this.removeFav(result[0].id);
                    $event.srcElement.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.lastChild.data--;
                    $event.srcElement.children[0].className = 'icon icon-md ion-md-heart-outline';
                    $event.srcElement.style.color = '#b6b6b6';

                } else {
                    this.addLike(reference_id, like_type);
                    $event.srcElement.style.backgroundColor = '#296fb7';
                    $event.srcElement.offsetParent.style.backgroundColor = '#296fb7';
                    $event.srcElement.lastChild.data++;
                    $event.srcElement.children[0].className = 'icon icon-md ion-md-heart';
                    $event.srcElement.style.color = '#f2f2f2';
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

    addLike(reference_id, like_type) {
        this.httpProvider.addLike(this.likeendpoint, reference_id, this.user.id, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }


    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.user.id;

            });

            if (!found) {
                return '#f2f2f2';

            } else {
                return '#296fb7';

            }
        }

    }

    getIcon(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.user.id;

            });

            if (!found) {
                return 'md-heart-outline';

            } else {
                return 'md-heart';

            }
        }

    }


    getColor(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.user.id;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    removeFav(recordID) {
        this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
        this.httpProvider.removeFollowRecordID(recordID, 'favorites');

    }


    shareController(activity) {
        this.disable = true;
        let imgURI = activity.photo_url,
            title = this.createMessageForShare(activity),
            msg = 'MESSAGE---';
        this.shareProvider.otherShare(title, msg, imgURI, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            })
            .catch((err) => {
                console.log(err);
                this.disable = false;
            })
    }

    ellipsysController(activity) {
        this.disable = true;
        let imgURI = activity.photo_url,
            title = this.createMessageForShare(activity),
            msg = 'MESSAGE---';

        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(title, msg, imgURI, constants.appStoreUrl)
                            .then(() => {
                                this.disable = false;
                            })
                            .catch((err) => {
                                console.log(err);
                                this.disable = false;
                            })
                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.shareViaEmail();
                        this.disable = false;
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                        this.disable = false;
                    }
                }
            ]
        });

        actionSheet.present();
    }

    createMessageForShare(data) {
        let message = '';
        let action = data.action;
        if (action === 'call' || action === 'fax' || action === 'email' || action === 'tweet') {
            message = `${data.fname} used Rally to ${action} ${data.representative}`;
        } else {
            message = data.objective;
        }
        return message;
    }

    addShareAction(goal_id, action_type_id) {
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.user.id);
    }

    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "My Profile"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    goToActionPage(objectiveID, goal_type, source, goalID, repID, activity) {
        console.log('ACTIVITY');
        console.log(goal_type);
        if (goal_type === "contact") {
            this.navCtrl.push(OrganizationActionPage, {
                objectiveID: objectiveID,
                pageName: 'My Profile'
            }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
        } else if (goal_type === 'sign') {
            let params = {
                iframeUrl: source,
                repID: repID,
                goalID: goalID,
                imgURI: activity.photo_url,
                titleForShare: activity.organization,
                title: 'sign',
                action_type_id: '73637819-9571-4070-9162-abf41fc50c71'
            };
            this.sign(params);
        } else if (goal_type === 'donate') {
            let params = {
                iframeUrl: source,
                repID: repID,
                goalID: goalID,
                imgURI: activity.photo_url,
                titleForShare: activity.organization,
                title: 'donat',
                action_type_id: '500f35fc-9338-4f1d-bdc8-13302afa33e7'
            };
            this.donate(params);
        }
    }

    donate(params) {
        let options = constants.themeAbleOptions;
        const browser = this.themeAbleBrowser.create(params.iframeUrl, '_system', options);

        setTimeout(() => {
            let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackDonateRows});
            modal.onDidDismiss((data) => {
                switch (data.actionId) {
                    case 1: {
                        this.streakSignModal(params);
                        this.addAction(params);
                    }
                        break;

                    case 2: {
                        this.errorSignModal();
                    }
                }
            });
            modal.present();
        }, 2000);
    }

    sign(params) {
        const options = constants.themeAbleOptions;
        const browser = this.themeAbleBrowser.create(params.iframeUrl, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                (data) => {
                    browser.executeScript({
                        code: 'document.body.style.paddingTop = "50px"'
                    })
                },
                err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                });
        browser.on('closePressed').subscribe(data => {
            browser.close();
            let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackSignRows});
            modal.onDidDismiss((data) => {
                switch (data.actionId) {
                    case 1: {
                        this.streakSignModal(params);
                        this.addAction(params);
                    }
                        break;

                    case 2: {
                        this.errorSignModal();
                    }
                }
            });
            modal.present();
        })
    }

    errorSignModal() {
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

    addAction(params) {
        let data = {
            goal_id: params.goalID,
            representative_id: params.repID,
            action_type_id: params.action_type_id,
            title: params.title,
            user_id: this.currentRallyID
        };
        this.httpProvider.addAction('actions', data);
    }

    streakSignModal(params) {
        let data = {
            imgURI: params.imgURI,
            titleForShare: params.titleForShare
        };
        let modal = this.modalCtrl.create(ThankYouPage, data);
        modal.present();
    }

    openWebpage(url?, target?) {
        return new Promise((resolve, reject) => {
            let options = constants.themeAbleOptions;
            if (!target) {
                target = '_blank';
            }
            const browser: ThemeableBrowserObject = this.themeAbleBrowser.create(url, target, options);
            resolve(true);

            browser.on("loadstop")
                .subscribe(
                    () => {
                        browser.executeScript({
                            code: 'document.body.style.paddingTop = "50px"'
                        })
                    },
                    err => {
                        reject();
                        console.log("InAppBrowser Loadstop Event Error: " + err);
                    });

            browser.on('closePressed').subscribe(data => {
                browser.close();
            })
        });
    }

    transform(value: any) {
        if (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    }

    giveFeedBack() {
        this.shareProvider.feedback();
    }


}