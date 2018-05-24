import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ActionSheetController,
    ToastController,
    ModalController,
    PopoverController,
    ViewController,
    LoadingController
} from 'ionic-angular';
import {FilterEventsPage} from '../filter-events/filter-events';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {OverlayPage} from '../overlay/overlay'
import {UsersProvider} from '../../providers/users/users';
import {EventDetailPage} from '../event-detail/event-detail';
import 'rxjs/add/operator/debounceTime';
import {FormControl} from '@angular/forms';
import {Storage} from '@ionic/storage';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {ThankYouPage} from '../thank-you/thank-you';
import {DomSanitizer} from '@angular/platform-browser';
import {ThanksPage} from '../thanks/thanks';
import {FilterModel} from "../../models/filter-model";
import {DataProvider} from "../../providers/data/data";
import * as constants from "../../constants/constants";


@IonicPage()
@Component({
    selector: 'page-events',
    templateUrl: 'events.html',
})
export class EventsPage {

    public filterState: FilterModel;
    endpoint: string = 'events_pagination/';
    public events: any = [];
    searchTerm: string = '';
    searchControl: FormControl;
    searching: any = false;
    testPhoto: any = 'https://c1.staticflickr.com/9/8409/buddyicons/41284017@N08_l.jpg?1369764880#41284017@N08';
    myrallyID: any;
    favEndpoint: any = 'actions';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    eventLike: any = 'd5d1b115-dbb6-4894-8935-322c336ae951';
    likeendpoint: any = 'likes';
    disable: boolean = false;
    organizationEndpoint: any = 'following_organizations';
    eventFiltered: boolean = false;
    private start: number = 1;
    loading: any;
    endpointOld: any = 'events';
    safeSvg: any;
    loader: boolean = false;
    enablePlaceholder: boolean = true;
    private baseFilterState: string;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public popoverCtrl: PopoverController,
        private httpProvider: UsersProvider,
        private dataService: DataProvider,
        public storage: Storage,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController,
        private shareProvider: SocialShareProvider,
        public actionSheetCtrl: ActionSheetController,
        private orgProvider: OrganizationsProvider,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer) {

        this.filterState = new FilterModel();
        this.searchControl = new FormControl();
        this.enablePlaceholder = true;
        this.setBaseFilterState();

        this.httpProvider.returnRallyUserId().then(user => {
            this.myrallyID = user.apiRallyID;
            this.getFilterSettings();
        });
    }

    setBaseFilterState() {
        let baseFilterState = new FilterModel();
        let date = this.dataService.getCurrentDate();
        baseFilterState.timeStarts = date.currentDate;
        baseFilterState.timeEnds = date.nextYear;
        this.baseFilterState = JSON.stringify(baseFilterState);
    }

    getFilterSettings() {
        this.storage.get('eventsFilterState').then((data) => {
            if (data) {
                this.filterState = JSON.parse(data);
            }

            let date = this.dataService.getCurrentDate();

            if (!this.filterState.timeStarts || this.filterState.timeStarts === '') {
                this.filterState.timeStarts = date.currentDate;
            }
            if (!this.filterState.timeEnds || this.filterState.timeEnds === '') {
                this.filterState.timeEnds = date.nextYear;
            }

            this.getdata();
        });
    }

    checkDifferentFilterState() {
        let currentFilterState = JSON.stringify(this.filterState);
        if (this.baseFilterState === currentFilterState) {
            this.eventFiltered = false;
        } else {
            this.eventFiltered = true;
        }
        console.log('CHECK DIFFERENT');
        console.log(currentFilterState);
        console.log(this.baseFilterState);
        console.log(this.baseFilterState === currentFilterState);
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
        this.events = [];
        this.loader = true;
        this.getdata().then(() => {
            refresher.complete();
        });
    }

    getdata() {
        this.checkDifferentFilterState();
        if (this.filterState.timeStarts && this.filterState.timeStarts !== '') {
            if (this.filterState.filterBy === 'all') {
                return this.getFilteredEvents(this.filterState.timeStarts, this.filterState.timeEnds, this.filterState.zipcode, this.filterState.distance);

            } else if (this.filterState.filterBy !== 'all') {
                return this.getFollowedEvents(this.filterState.timeStarts, this.filterState.timeEnds, this.filterState.zipcode, this.filterState.distance);
            }
        } else {
            return this.getAllEvents();
        }

    }


    getFollowedEvents(startDate, endDate, zipcode, distance) {
        if (this.start === 1) {
            this.events = [];
        }

        return new Promise((resolve, reject) => {
            this.orgProvider.load(this.endpointOld + '/' + this.myrallyID + '/' + zipcode + '/' + startDate + '/' + endDate + '/' + distance + '/', this.start)
                .then(data => {
                    this.getArray(data['Events']);
                    resolve(true);
                }, err => {
                    reject(err);
                });
        });
    }

    getAllEvents() {
        if (this.start === 1) {
            this.events = [];
        }
        return new Promise((resolve, reject) => {
            this.orgProvider.load(this.endpoint, this.start)
                .then(data => {
                    this.getArray(data);
                    resolve(true);
                }, err => {
                    reject(err);
                });
        });
    }

    getArray(array) {
        console.log(this.events);
        for (let event of array) {
            this.events.push(event);
        }

        this.enablePlaceholder = false;
    }

    getFilteredEvents(startDate, endDate, zipcode, distance) {
        if (this.start === 1) {
            this.events = [];
        }

        return new Promise((resolve, reject) => {
            this.orgProvider.load(this.endpointOld + '/' + zipcode + '/' + startDate + '/' + endDate + '/' + distance + '/', this.start).then(
                result => {
                    console.log(result);
                    this.getArray(result['events']);
                    resolve(true);
                }, err => {
                    reject(err);
                });
        });

    }

    doInfinite(infiniteScroll: any) {
        this.start += 1;
        if (this.filterState.filterBy === 'followed') {
            this.getFollowedEvents(this.filterState.timeStarts, this.filterState.timeEnds, this.filterState.zipcode, this.filterState.distance).then(() => {
                infiniteScroll.complete();
            });
        } else if (this.filterState.filterBy === 'all') {
            this.getFilteredEvents(this.filterState.timeStarts, this.filterState.timeEnds, this.filterState.zipcode, this.filterState.distance).then(() => {
                infiniteScroll.complete();
            });

        } else {
            this.getAllEvents().then(() => {
                infiniteScroll.complete();
            });
        }
    }


    goToEventDetail(eventID) {
        console.log(eventID);
        this.navCtrl.push(EventDetailPage, {
            eventID: eventID,
            eventPageName: "Events"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }


    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Events"
        });
    }

    goToEventFilter() {
        // this.navCtrl.push(FilterEventsPage);
        let modal = this.modalCtrl.create(FilterEventsPage, {location: 'events'});
        modal.onDidDismiss((data) => {
            console.log('Test');
            if (data === 'back') {
                console.log("No refresh");
            } else {
                this.enablePlaceholder = true;
                this.start = 1;
                this.getFilterSettings();

            }

        });
        modal.present();
    }

    onSearchInput() {
        this.searching = true;
    }


    removeEventFav(recordID) {
        this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });

    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
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
                    this.removeEventFav(result[0].id);
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
        this.shareProvider.otherShare(title,'MESSAGE ---', imgURI, constants.appStoreUrl)
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

    eventEllipsisController(name, orgID, followers, notify, title, imgURI) {
        this.disable = true;
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this event via...',
                    handler: () => {
                        console.log("test");
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

}
