import {Component} from '@angular/core';
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
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {UsersProvider} from '../../providers/users/users';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {OrganizationActionPage} from '../organization-action/organization-action';
import {AngularFireDatabase} from 'angularfire2/database';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {ThanksPage} from '../thanks/thanks';
import {DomSanitizer} from '@angular/platform-browser';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {FriendsRequestPage} from '../friends-request/friends-request';
import {Storage} from '@ionic/storage';
import {DataProvider} from "../../providers/data/data";
import {ThemeableBrowser, ThemeableBrowserObject} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';
import {ThankYouPage} from "../thank-you/thank-you";
import {IssueScreenPage} from "../issue-screen/issue-screen";


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
        private themeAbleBrowser: ThemeableBrowser,
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
        event.stopPropagation();
        this.openWebpage(event.target.href);
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
                    (data) => {
                        browser.executeScript({
                            code: 'document.body.style.paddingTop = "50px"'
                        })
                    },
                    err => {
                        reject();
                        console.log("InAppBrowser Loadstop Event Error: " + err);
                    });

            browser.on('closePressed').subscribe(data => {
                console.log('closePressed');
                browser.close();
            })
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

    goToActionPage(objectiveID, goal_type, source, goalID, repID, imgURI, title) {
        if (goal_type === "contact") {
            this.navCtrl.push(OrganizationActionPage, {
                objectiveID: objectiveID,
                pageName: 'Take Action'
            }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
        } else if (goal_type === 'sign') {
            let params = {
                iframeUrl: source,
                repID: repID,
                goalID: goalID,
                imgURI: imgURI,
                titleForShare: title,
                title: 'sign',
                action_type_id: '73637819-9571-4070-9162-abf41fc50c71'
            };
            this.sign(params);
        } else if (goal_type === 'donate') {
            let params = {
                iframeUrl: source,
                repID: repID,
                goalID: goalID,
                imgURI: imgURI,
                titleForShare: title,
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
        modal.present();
    }

    addAction(params) {
        let data = {
            goal_id: params.goalID,
            representative_id: params.repID,
            action_type_id: params.action_type_id,
            title: params.title,
            user_id: this.myrallyID
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
        this.shareProvider.otherShare(title, 'MESSAGE ---', imgURI, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            }, err => {
                console.log(err);
                this.disable = false;
            })
    }

    addShareAction(goal_id, action_type_id) {
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myrallyID);
    }

    ellipsisController(name, id, index, orgID, desc, followers, notify, title, imgURI) {
        this.disable = true;
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        this.shareProvider.otherShare(title, 'MESSAGE ---', imgURI, constants.appStoreUrl)
                            .then(() => {
                                this.disable = false;
                            }, err => {
                                console.log(err);
                                this.disable = false;
                            })
                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiers(orgID);
                        this.disable = false;
                    }
                },
                {
                    text: this.getOrganizationFollowStatus(followers) + ' ' + name,
                    handler: () => {
                        this.orgStatus(orgID);
                        console.log("test");
                        this.disable = false;
                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
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
