import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    ViewController,
    NavParams,
    ToastController,
    ActionSheetController,
    LoadingController
} from 'ionic-angular';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {PublicProfilePage} from '../public-profile/public-profile';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {UsersProvider} from '../../providers/users/users';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {ModalController} from 'ionic-angular/components/modal/modal-controller';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {OrganizationActionPage} from '../organization-action/organization-action';
import {SignFeedBackPage} from '../sign-feed-back/sign-feed-back';
import {ThanksPage} from '../thanks/thanks';
import {DomSanitizer} from '@angular/platform-browser';
import {AngularFireDatabase} from 'angularfire2/database';
import firebase from 'firebase';
import {DonateFeedBackPage} from "../donate-feed-back/donate-feed-back";
import * as constants from "../../constants/constants";
import {ThemeableBrowser, ThemeableBrowserObject} from "@ionic-native/themeable-browser";


@IonicPage()
@Component({
    selector: 'page-friendsactivity',
    templateUrl: 'friendsactivity.html',
})
export class FriendsactivityPage {

    myRallyID: any;
    endpoint: string = 'community_feed/all/';
    all: string = "all";
    disable: boolean = false;
    activityLike: any = 'd32c1cb5-b076-4353-ad9c-1c8f81d812e3';
    likeendpoint: any = 'likes';
    favEndpoint: any = 'actions';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    enable: boolean = true;
    public records: any = [];
    public following: any = [];
    safeSvg: any;
    loading: any;
    loader: boolean = false;
    enablePlaceholder: boolean = true;
    followEndpoint: string = 'following_users';
    notificationsEndpoint: any = 'devices';
    alertsEndpoint: any = 'ux_events';
    singleEndpoint: any = 'community_feed';


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        private httpProvider: OrganizationsProvider,
        private themeAbleBrowser: ThemeableBrowser,
        public viewCtrl: ViewController,
        private usersProvider: UsersProvider,
        public toastCtrl: ToastController,
        public actionSheetCtrl: ActionSheetController,
        private shareProvider: SocialShareProvider,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer,
        private db: AngularFireDatabase) {
        this.all = "all";
        this.enable = false;
        this.enablePlaceholder = true;

        this.usersProvider.returnRallyUserId().then(user => {
            this.myRallyID = user.apiRallyID;
            this.getdata();
            this.getPersonaldata();
        });


    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FriendsactivityPage');
    }

    goToHome() {
        this.navCtrl.setRoot(FeedPage);
    }

    goToAlerts() {
        this.navCtrl.setRoot(AlertsPage);
    }

    goToProfile() {
        this.navCtrl.setRoot(ProfilePage);
    }

    presentPopover() {
        let popover = this.popoverCtrl.create(OverlayPage);
        popover.present();
    }

    goToPublicProfile(userID) {
        this.navCtrl.push(PublicProfilePage, {
            param1: userID,
            profilePageName: "Community"
        });
    }

    doRefresh(refresher) {
        this.records = [];
        this.following = []
        this.loader = true;
        this.getdata();
        this.getPersonaldata();

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    getdata() {

        return new Promise(resolve => {
            this.httpProvider.getRecords(this.endpoint + this.myRallyID)
                .then(data => {
                    console.log("Full Data", data);
                    this.getArray(data['Objectives_Actions']);
                    this.getArray(data['Direct_Actions']);
                    this.getArray(data['Contact_Actions']);
                    //this.loading.dismiss();
                    this.enablePlaceholder = false;
                    this.loader = false;
                    resolve(true);

                });
        });

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

    getPersonaldata() {
        return new Promise(resolve => {
            this.httpProvider.getRecords(this.singleEndpoint + '/' + this.myRallyID)
                .then(data => {
                    console.log("Personal Data", data);
                    this.getFollowingArray(data['Objectives_Actions']);
                    this.getFollowingArray(data['Direct_Actions']);
                    this.getFollowingArray(data['Contact_Actions']);


                    resolve(true);

                });
        });

    }

    getFollowingArray(array) {
        for (let person of array) {
            this.following.push(person);
            this.sortArray(this.following);
        }

    }


    getLikeStatus($event, reference_id, like_type, likes) {
        this.disable = true;

        this.usersProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myRallyID).subscribe(
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
        this.usersProvider.addLike(this.likeendpoint, reference_id, this.myRallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myRallyID;

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
                return el == this.myRallyID;

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
                return el == this.myRallyID;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    removeFav(recordID) {
        this.usersProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
        this.usersProvider.removeFollowRecordID(recordID, 'favorites');

    }

    streakModal() {
        let modal = this.modalCtrl.create(ThanksPage);
        modal.present();
    }

    shareController(title, imgURI, reference_id, like_type, $event) {
        this.disable = true;

        const actionSheet = this.actionSheetCtrl.create({
            title: 'Share to where?',
            buttons: [
                {
                    text: 'Facebook',
                    handler: () => {
                        this.shareProvider.facebookShare(title, imgURI);
                        this.addShareAction(reference_id, like_type);
                        $event.path[1].lastChild.data++;
                        this.streakModal();
                        this.disable = false;

                    }
                },
                {
                    text: 'Twitter',
                    handler: () => {
                        this.shareProvider.twitterShare(title, imgURI).then(() => {
                            this.addShareAction(reference_id, like_type);
                            $event.path[1].lastChild.data++;
                            this.streakModal();
                            this.disable = false;
                        }).catch((error) => {
                            console.error("shareViaWhatsapp: failed", error);
                            this.disable = false;

                        });


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


    addShareAction(goal_id, action_type_id) {
        this.usersProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myRallyID);
    }

    segmentChanged() {
        console.log(this.enable);
        this.enable = !this.enable;
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
            OrgPageName: "Community"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    goToActionPage(objectiveID, goal_type, source, goalID, repID) {

        if (goal_type === 'sign') {
            this.navCtrl.push(SignFeedBackPage, {iframeUrl: source, repID: repID, goalID: goalID}, {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'forward'
            });
        } else if (goal_type === 'donate') {
            this.openWebpage(source, '_system')
                .then(() => {
                    this.navCtrl.push(DonateFeedBackPage, {iframeUrl: source, repID: repID, goalID: goalID}, {
                        animate: true,
                        animation: 'transition',
                        duration: 500,
                        direction: 'forward'
                    });
                }, err => {
                    console.log(err);
                })
        } else {
            this.navCtrl.push(OrganizationActionPage, {
                objectiveID: objectiveID,
                pageName: 'Community'
            }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
        }
    }

    openWebpage(url?, target?) {
        return new Promise((resolve, reject) => {
            let options = constants.themeAbleOptions;
            if(!target) {
                target = '_blank';
            }
            const browser: ThemeableBrowserObject = this.themeAbleBrowser.create(url, target, options);
            resolve(true);

            browser.on("loadstop")
                .subscribe(
                    () => {
                        browser.insertCss({
                            code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
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

    userEllipsisController(name, userid, followers, message) {
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(name, message);

                    }
                },
                {
                    text: this.getFollowStatus(followers) + ' ' + name,
                    handler: () => {
                        console.log("test");
                        this.followUser(userid);

                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.shareViaEmail();

                    }
                },
                {
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

    getFollowStatus(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myRallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }


    followUser(userid) {
        let user: any = firebase.auth().currentUser;
        let followRef = this.db.database.ref('follow/' + user['uid'] + '/' + userid);
        followRef.once('value', snapshot => {
            if (snapshot.hasChildren()) {
                console.log('You already follow this user');
                this.getFollowRecordID(userid);

            } else {
                this.followFriend(userid);
                // this.getDeviceID(userid);
            }
        });
    }

    getFollowRecordID(parameter) {
        this.usersProvider.getJsonData(this.followEndpoint + '?follower_id=' + this.myRallyID + '&following_id=' + parameter).subscribe(
            result => {
                console.log("Delete User ID : " + result[0].id);
                this.unFollowFriend(result[0].id, parameter);
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            });
    }

    unFollowFriend(recordID, parameter) {
        this.usersProvider.unfollowOrganization(this.followEndpoint, recordID);
        this.usersProvider.removeFollowRecordID(parameter, 'follow');
    }

    getDeviceID(user_id) {
        //Reemplazar por parametro despues
        this.httpProvider.getJsonData(this.notificationsEndpoint + '?user_id=' + user_id)
            .subscribe(result => {
                this.saveNotification(user_id, result[0].id, this.myRallyID);
                this.sendPushNotification(result[0].registration_id);

            }, err => {
                console.error("Error: " + err);
            }, () => {
                console.log("Data Completed");
            });
    }

    saveNotification(user_id, registration_id, sender_id) {
        this.usersProvider.returnRallyUserId().then(user => {
            this.usersProvider.saveNotification(user_id, registration_id, user.displayName + " wants to follow you", this.alertsEndpoint, sender_id);
        });
        //this.httpProvider.sendNotification(registration_id, msg);
    }

    followFriend(friendID) {
        this.usersProvider.followFriend(this.followEndpoint, this.myRallyID, friendID, true).subscribe(data => {
            console.log(data);
            this.usersProvider.saveFollowRecordID(data.following_id, data.id, 'follow');
            this.getDeviceID(friendID);
        }, error => {
            console.log("Error", error);
        });
        ;
    }

    sendPushNotification(device) {
        this.usersProvider.sendPushNotification(device, 'New Follow Request')
            .subscribe(result => {
                console.log("Noti", result);
            });
    }


}
