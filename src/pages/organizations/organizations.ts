import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ViewController,
    ActionSheetController,
    ToastController,
    ModalController,
    LoadingController
} from 'ionic-angular';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {UsersProvider} from '../../providers/users/users';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {OrganizationActionPage} from '../organization-action/organization-action';
import {EventDetailPage} from '../event-detail/event-detail';
import {FilterEventsPage} from '../filter-events/filter-events';
import {Storage} from '@ionic/storage';
import {DomSanitizer} from '@angular/platform-browser';
import {SignFeedBackPage} from '../sign-feed-back/sign-feed-back';
import {ThanksPage} from '../thanks/thanks';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';


@IonicPage()
@Component({
    selector: 'page-organizations',
    templateUrl: 'organizations.html',
})
export class OrganizationsPage {
    organizations: any;
    endpoint: string = 'my_organizations_pagination/';
    myApiRallyID: any;
    favEndpoint: any = 'actions';
    hide_enpoint: any = 'hide_objective';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    goalLike: any = 'ea9bd95e-128c-4a38-8edd-938330ad8b2d';
    tweetLike: any = 'ab860ccb-9713-49e5-b844-34d18f92af21';
    eventLike: any = 'd5d1b115-dbb6-4894-8935-322c336ae951';
    likeendpoint: any = 'likes';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    disable: boolean = false;
    organizationEndpoint: any = 'following_organizations';
    events: any;
    eventStart: any;
    eventEnd: any;
    eventFiltered: boolean = false;
    public records: any = [];
    private start: number = 1;
    loading: any;
    filterBy: any;
    safeSvg: any;
    loader: boolean = false;
    enablePlaceholder: boolean = true;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        private httpProvider: OrganizationsProvider,
        private rallyProvider: UsersProvider,
        public viewCtrl: ViewController,
        public actionSheetCtrl: ActionSheetController,
        private shareProvider: SocialShareProvider,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        private storage: Storage,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer,
        private themeableBrowser: ThemeableBrowser) {
        this.enablePlaceholder = true;
        this.rallyProvider.returnRallyUserId()
            .then(user => {
                console.log(user);
                this.myApiRallyID = user.apiRallyID;
                this.getdata();

            });

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OrganizationsPage');
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

    doRefresh(refresher) {
        this.start = 1;
        this.records = [];
        // this.loading = this.loadingCtrl.create({
        //   spinner: 'hide',
        //   content: this.safeSvg,
        //   });
        //   this.loading.present();
        this.loader = true;
        this.getdata();
        this.eventFiltered = false;

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    getdata(startDate?, endDate?, filterBy?) {

        if (startDate != null) {
            if (filterBy !== 'all') {
                var url = this.endpoint + this.myApiRallyID + '/';


            } else {
                var url = this.endpoint + 'all-events/' + this.myApiRallyID + '/';


            }
            this.eventFiltered = true;
        } else {
            var url = this.endpoint + this.myApiRallyID + '/';
        }

        return new Promise(resolve => {
            this.httpProvider.loadHome(url, this.start)
                .then(data => {
                    // this.records = [];

                    console.log("Full Data", data);
                    this.getArray(data['My_Organizations']);
                    this.getArray(data['Orgs_events']);
                    this.getArray(data['Org_Tweets']);

                    //this.organizations = data;

                    resolve(true);
                    //this.loading.dismiss();
                    this.enablePlaceholder = false;
                    this.loader = false;

                });
        });
    }

    getArray(array) {
        // console.log(array);
        for (let person of array) {
            // console.log(person);
            this.records.push(person);
            // console.log("Records", this.records);
        }

    }

    doInfinite(infiniteScroll: any) {
        console.log(infiniteScroll);
        console.log('doInfinite, start is currently ' + this.start);
        this.start += 1;
        console.log(this.start);

        this.getdata().then(() => {
            infiniteScroll.complete();
        });

    }


    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "My Organizations"
        });
    }

    goToActionPage(objectiveID, goal_type, source, goalID, repID) {
        if (goal_type !== "sign") {
            this.navCtrl.push(OrganizationActionPage, {
                objectiveID: objectiveID,
                pageName: 'Organizations'
            }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
        } else {
            this.navCtrl.push(SignFeedBackPage, {iframeUrl: source, repID: repID, goalID: goalID}, {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'forward'
            });
        }

    }


    hideItem(objective_id, index) {
        this.rallyProvider.hideObjective(this.hide_enpoint, this.myApiRallyID, objective_id);
        (this.organizations).splice(index, 1);
    }


    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myApiRallyID;
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
                return el == this.myApiRallyID;

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
                return el == this.myApiRallyID;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    removeFav(recordID) {
        this.rallyProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
        this.rallyProvider.removeFollowRecordID(recordID, 'favorites');
    }

    getLikeStatus($event, reference_id, like_type) {
        this.disable = true;
        this.rallyProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myApiRallyID).subscribe(
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
        this.rallyProvider.addLike(this.likeendpoint, reference_id, this.myApiRallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }

    streakModal() {
        let modal = this.modalCtrl.create(ThanksPage);
        modal.present();
    }

    shareController(title, imgURI, tweetImage?) {
        let imgUrl = imgURI;
        if (tweetImage && tweetImage !== '') {
            imgUrl = tweetImage;
        }
        this.disable = true;
        this.shareProvider.otherShare(title, 'MESSAGE---', imgUrl, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            }, err => {
                console.log(err);
                this.disable = false;
            })
    }

    addShareAction(goal_id, action_type_id) {
        this.rallyProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myApiRallyID);
    }

    ellipsisController(name, id, index, orgID, desc, followers, notify, title, imgURI) {
        this.disable = true;
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(desc, 'MESSAGE---', imgURI, constants.appStoreUrl)
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


    orgStatus(orgID) {
        this.rallyProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myApiRallyID + '&organization_id=' + orgID).subscribe(
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

        this.rallyProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.rallyProvider.removeFollowRecordID(orgID, 'organizations');
    }

    followOrg(organizationID) {
        this.rallyProvider.followOrganization(this.organizationEndpoint, this.myApiRallyID, organizationID);

    }


    eventEllipsisController(name, orgID, desc, followers, notify, imgURI, tweetImage) {
        let imgUrl = imgURI;
        if (tweetImage && tweetImage !== '') {
            imgUrl = tweetImage;
        }
        this.disable = true;

        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this event via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(desc, 'MESSAGE---', imgUrl, constants.appStoreUrl)
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

    notifyExist(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myApiRallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiers(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myApiRallyID + '&organization_id=' + orgID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.rallyProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.rallyProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }

    goToEventDetail(eventID) {
        console.log(eventID);
        this.navCtrl.push(EventDetailPage, {
            eventID: eventID,
            eventPageName: "Home"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    getDay(day) {
        var d = new Date(day);
        var weekday = new Array(7);
        weekday[0] = "SUNDAY";
        weekday[1] = "MONDAY";
        weekday[2] = "TUESDAY";
        weekday[3] = "WEDNESDAY";
        weekday[4] = "THURSDAY";
        weekday[5] = "FRIDAY";
        weekday[6] = "SATURDAY";
        var n = weekday[d.getDay()];
        return n;
    }

    getShortDate(day) {
        var d = new Date(day);
        var dd = d.getDate();

        var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        // console.log(monthNames[d.getMonth()]);
        var date = monthNames[d.getMonth()] + ' ' + dd;
        return date;
    }

    goToEventFilter() {
        // this.navCtrl.push(FilterEventsPage,  {}, {animate:true,animation:'ios-transition',duration:500,direction:'forward'});
        let modal = this.modalCtrl.create(FilterEventsPage, {location: 'orgs'});
        modal.onDidDismiss((data) => {
            console.log(data);
            if (data === 'back') {
                console.log("No refresh");
            } else {
                this.getStartDate();
            }

        });
        modal.present();

    }

    getStartDate() {
        this.storage.get('startDate').then((val) => {
            this.eventStart = val;
            this.getEndDate();

        });
    }

    getEndDate() {
        this.storage.get('endDate').then((val) => {
            this.eventEnd = val;
            this.getFilterType();
        });
    }

    getFilterType() {
        this.storage.get('filterBy').then((val) => {
            this.filterBy = val;
            this.getdata(this.eventStart, this.eventEnd, this.filterBy);
            this.records = [];
            // this.loading = this.loadingCtrl.create({
            //   spinner: 'hide',
            //   content: this.safeSvg, 
            // }); 
            //   this.loading.present();
            this.enablePlaceholder = true;

        });
    }


    getOrganizationFollowStatus(actions) {
        console.log("Followers", actions);
        if (actions != null) {
            var found = actions.some(el => {
                return el.id == this.myApiRallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }

    openWebpage(username, tweetID) {
        var url: string = 'https://twitter.com/' + username + '/status/' + tweetID;
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
}
