import {Component, Sanitizer} from '@angular/core';
import {
    IonicPage,
    NavController,
    ViewController,
    NavParams,
    ToastController,
    ActionSheetController,
    ModalController,
    LoadingController
} from 'ionic-angular';
import {CallPage} from '../call/call';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {UsersProvider} from '../../providers/users/users';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {OrganizationActionPage} from '../organization-action/organization-action';
import {AngularFireDatabase} from 'angularfire2/database';
import firebase from 'firebase';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {ThankYouPage} from '../thank-you/thank-you';
import {SignFeedBackPage} from '../sign-feed-back/sign-feed-back';
import {ThanksPage} from '../thanks/thanks';
import {DomSanitizer} from '@angular/platform-browser';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {DonateFeedBackPage} from '../donate-feed-back/donate-feed-back';
import {FriendsRequestPage} from '../friends-request/friends-request';
import {FilterEventsPage} from '../filter-events/filter-events';
import {Storage} from '@ionic/storage';
import {DataProvider} from "../../providers/data/data";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser";


@IonicPage()
@Component({
    selector: 'page-takeaction',
    templateUrl: 'takeaction.html',
})
export class TakeactionPage {

    all: string = "all";
    endpoint: string = 'objectives/take_action/';
    objectives: any;
    myrallyID: any;
    favEndpoint: any = 'actions';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    hide_enpoint: any = 'hide_objective';
    goalLike: any = 'ea9bd95e-128c-4a38-8edd-938330ad8b2d';
    likeendpoint: any = 'likes';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    disable: boolean = false;
    organizationEndpoint: any = 'following_organizations';
    safeSvg: any;
    loading: any;
    loader: boolean = false;
    enablePlaceholder: boolean = true;
    enable: boolean = true;
    eventFiltered: boolean = false;
    newEndpoint: any = 'homefeed_pagination/';
    private start: number = 1;
    public records: any = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public actionSheetCtrl: ActionSheetController,
        public popoverCtrl: PopoverController,
        private httpProvider: UsersProvider,
        private dataProvider: DataProvider,
        public toastCtrl: ToastController,
        private db: AngularFireDatabase,
        private shareProvider: SocialShareProvider,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer,
        private inAppBrowser: InAppBrowser,
        public orgProvider: OrganizationsProvider,
        private storage: Storage
    ) {
        this.all = "all";
        this.enable = false;
        this.enablePlaceholder = true;
        this.httpProvider.returnRallyUserId()
            .then(user => {
                this.myrallyID = user.apiRallyID;
                this.getdata();
                this.saveLog();

            });
    }

    segmentChanged() {
        this.enable = !this.enable;
    }

    formatDescription(text) {
        let tempDescr = this.dataProvider.linkify(text);
        return this.sanitizer.bypassSecurityTrustHtml(tempDescr);
    }

    addListeners() {
        this.objectives.map((el) => {
            el['formattedDescription'] = this.formatDescription(el['description']);
        });
        setTimeout(() => {
            this.addListener();
        }, 1000);
    }

    addListener() {
        let links = document.getElementsByClassName('link-to');

        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', this.openLinkInappBrowser.bind(this));
        }
    }

    openLinkInappBrowser(event) {
        event.preventDefault();
        this.openWebpage(event.target.href);
    }

    openWebpage(url?) {
        const options: InAppBrowserOptions = {
            zoom: 'no',
            toolbarposition: 'top',
            location: 'no'
        }

        const browser = this.inAppBrowser.create(url, '_blank', options);

        // Add styles for browser page
        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.insertCSS({
                        code: "header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
                    })
                },
                err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                });

        // Inject scripts, css and more with browser.X
    }

    goToRequests() {
        this.navCtrl.push(FriendsRequestPage, {}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    saveLog() {
        // console.log(this.myrallyID, 66666)
        this.httpProvider.addItem('log', JSON.stringify({
            user_id: this.myrallyID,
            screen: 'Homefeed',
            message: 'Visited'
        })).subscribe(data => {
            console.log("Log", data);
        });
    }

    doRefresh(refresher) {
        this.objectives = [];
        this.getdata();
        this.loader = true;

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }


    ionViewDidLoad() {
        console.log('ionViewDidLoad TakeactionPage');
    }

    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Contact Bob Representative',
            buttons: [
                {
                    text: 'Call',
                    handler: () => {
                        // this.navCtrl.push(CallPage);
                        this.navCtrl.setRoot(CallPage);
                    }
                }, {
                    text: 'Post on Facebook',
                    handler: () => {
                        console.log('Post on Facebook clicked');
                    }
                }, {
                    text: 'Post message via Twitter',
                    handler: () => {
                        console.log('Post message via Twitter clicked');
                    }
                }, {
                    text: 'Send a Fax',
                    handler: () => {
                        console.log('Send a Fax clicked');
                    }
                }, {
                    text: 'Email',
                    handler: () => {
                        console.log('Email clicked');
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

    presentPopover() {
        let popover = this.popoverCtrl.create(OverlayPage);
        popover.present();
    }


    getdata() {
        this.orgProvider.getJsonData(this.endpoint + this.myrallyID).subscribe(
            result => {
                this.objectives = result;
                this.enablePlaceholder = false;
                this.loader = false;
                this.addListeners();
                console.log("Objectives", JSON.stringify(result));
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            }
        );
    }


    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Take Action"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    goToActionPage(objectiveID, goal_type, source, goalID, repID) {
        if (goal_type === "contact") {
            this.navCtrl.push(OrganizationActionPage, {
                objectiveID: objectiveID,
                pageName: 'Take Action'
            }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
        } else if (goal_type === 'sign') {
            this.navCtrl.push(SignFeedBackPage, {iframeUrl: source, repID: repID, goalID: goalID}, {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'forward'
            });
        } else if (goal_type === 'donate') {
            this.navCtrl.push(DonateFeedBackPage, {iframeUrl: source, repID: repID, goalID: goalID}, {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'forward'
            });

        }

    }


    share(title, imgURI) {
        this.shareProvider.otherShare(title, imgURI);
    }


    removeFav(recordID) {
        this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
    }

    hideItem(objective_id, index) {
        this.httpProvider.hideObjective(this.hide_enpoint, this.myrallyID, objective_id);
        (this.objectives).splice(index, 1);
    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                console.log(el);
                return el == this.myrallyID;

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
                return el == this.myrallyID;

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
                return el == this.myrallyID;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    getLikeStatus($event, reference_id, like_type) {
        this.disable = true;
        this.httpProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myrallyID).subscribe(
            result => {
                console.log("Aqui", result);

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
        this.httpProvider.addLike(this.likeendpoint, reference_id, this.myrallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

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
                        this.disable = false;
                        this.streakModal();

                    }
                },
                {
                    text: 'Twitter',
                    handler: () => {
                        this.shareProvider.twitterShare(title, imgURI).then(() => {
                            this.addShareAction(reference_id, like_type);
                            $event.path[1].lastChild.data++;
                            this.disable = false;
                            this.streakModal();
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
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myrallyID);
    }

    ellipsisController(name, id, index, orgID, desc, followers, notify) {
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        this.shareProvider.otherShare(name, desc);

                    }
                },
                {
                    text: 'Hide post',
                    handler: () => {
                        this.hideItem(id, index);
                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiers(orgID);

                    }
                },
                {
                    text: this.getOrganizationFollowStatus(followers) + ' ' + name,
                    handler: () => {
                        this.orgStatus(orgID);
                        console.log("test");

                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");

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

    notifyExist(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myrallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiers(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }

    getOrganizationFollowStatus(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el.id == this.myrallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }


    orgStatus(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID).subscribe(
            result => {
                if (result != "") {
                    this.unfollowOrg(result[0].id, orgID);
                    console.log("Unfollow");
                } else {
                    console.log("Follow");
                    this.followOrg(orgID);
                }
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            });
    }


    unfollowOrg(recordID, orgID) {

        this.httpProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(orgID, 'organizations');
    }

    followOrg(organizationID) {
        this.httpProvider.followOrganization(this.organizationEndpoint, this.myrallyID, organizationID);
    }

}
