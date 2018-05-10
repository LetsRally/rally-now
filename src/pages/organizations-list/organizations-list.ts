import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    LoadingController,
    ToastController,
    ActionSheetController, Platform
} from 'ionic-angular';
import {UsersProvider} from '../../providers/users/users';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {AngularFireDatabase} from 'angularfire2/database';
import firebase from 'firebase';
import {Storage} from '@ionic/storage';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {FormControl} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from "rxjs/Subject";
import {Keyboard} from "@ionic-native/keyboard";


@IonicPage()
@Component({
    selector: 'page-organizations-list',
    templateUrl: 'organizations-list.html',
})
export class OrganizationsListPage {
    testPhoto:any = '../assets/img/event.png';
    endpoint: any = 'organizations';
    public organizations: any = [];
    public enableInfiniteScroll = true;
    loading: any;
    public items: any = [];
    currentRallyID: any;
    favEndpoint: any = 'actions';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    organizationEndpoint: any = 'following_organizations';
    private start: number = 1;
    newEndpoint: any = 'organization_pagination/';
    searchControl: FormControl;
    shouldShowCancel: any = false;
    searchTerm: string = '';
    private searchTerm$: Subject<string>;
    safeSvg: any;
    enablePlaceholder: boolean = true;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private platform: Platform,
        private keyboard: Keyboard,
        private httpProvider: UsersProvider,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        private db: AngularFireDatabase,
        public actionSheetCtrl: ActionSheetController,
        private storage: Storage,
        private orgProvider: OrganizationsProvider,
        private sanitizer: DomSanitizer) {

        this.searchControl = new FormControl();
        this.searchTerm$ = new Subject<string>();
        this.httpProvider.returnRallyUserId().then(
            user => {
                this.currentRallyID = user.apiRallyID;
                this.getOrganizations();
            });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FriendsRequestPage');
        this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
            this.shouldShowCancel = false;
        });

    }

    getOrganizations() {
        return new Promise(resolve => {
            this.orgProvider.load(this.newEndpoint, this.start)
                .then(data => {
                    this.getArray(data);
                    resolve(true);
                });
        });
    }

    triggerAlphaScrollChange() {
        console.log('TRIGGER--------');
    }

    getArray(array) {
        let temp = JSON.parse(JSON.stringify(this.items));
        temp = temp.concat(array);
        this.enablePlaceholder = false;
        this.items = temp;
    }

    doInfinite(infiniteScroll: any) {
        this.start += 1;
        this.getOrganizations().then(() => {
            infiniteScroll.complete();
        });
    }

    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Discover"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    // getItems(ev: any) {
    //     let val = ev.target.value;
    //
    //     // if the value is an empty string don't filter the items
    //     if (val && val.trim() != '') {
    //         this.items = this.items.filter((item) => {
    //             return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
    //         })
    //     }
    // }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el.id == this.currentRallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }

    addFollowRecordFirebase(organizationID, $event) {
        let user: any = firebase.auth().currentUser;
        let followRef = this.db.database.ref('organizations/' + user['uid'] + '/' + organizationID);
        followRef.once('value', snapshot => {
            if (snapshot.hasChildren()) {
                console.log('You already follow this org');
                this.unFollowActionSheet(organizationID, $event);

            } else {
                this.followOrg(organizationID, $event);
            }
        });
    }

    followOrg(organizationID, el) {
        this.httpProvider.followOrganization(this.organizationEndpoint, this.currentRallyID, organizationID);
        el.srcElement.innerText = 'Following';
    }

    unFollowActionSheet(organizationID, el) {

        let actionSheet = this.actionSheetCtrl.create({
            title: 'Unfollow this organization?',
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        console.log('Destructive clicked');
                        this.getOrganizationFollowRecordID(organizationID);
                        el.srcElement.innerText = 'Follow';

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

    getOrganizationFollowRecordID(organizationID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.currentRallyID + '&organization_id=' + organizationID).subscribe(
            result => {
                console.log("Delete ID : " + result[0].id);
                this.unfollow(result[0].id, organizationID);
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            }
        );
    }

    unfollow(recordID, organizationID) {

        this.httpProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(organizationID, 'organizations');
    }

    getFilteredData() {
        this.searchTerm$.next(this.endpoint + '/search/' + this.searchTerm);

        this.orgProvider.getSubjectJson(this.searchTerm$)
            .subscribe(result => {
                    this.enablePlaceholder = false;
                    this.items = result['organization'];
                },
                err => {
                    this.enablePlaceholder = false;
                    console.error("Error : " + err);
                },
                () => {
                    this.enablePlaceholder = false;
                    console.log('getData completed');
                });
    }

    onSearchInput() {
        if (this.searchTerm === "") {
            this.start = 1;
            this.items = [];
            this.shouldShowCancel = false;
            this.enablePlaceholder = true;
            this.enableInfiniteScroll = true;
            this.getOrganizations();
        } else {
            this.shouldShowCancel = true;
            this.items = [];
            this.enablePlaceholder = true;
            this.enableInfiniteScroll = false;
            this.getFilteredData();
        }

    }

    cancel() {
        if (this.platform.is('ios')) {
            this.keyboard.onKeyboardShow().take(1).subscribe(() => {
                this.keyboard.close();
            });
        }
        this.start = 1;
        this.items = [];
        this.enablePlaceholder = true;
        this.enableInfiniteScroll = true;
        this.getOrganizations();
    }

}