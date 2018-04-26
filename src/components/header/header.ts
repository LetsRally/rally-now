import {Component} from '@angular/core';
import {SearchResultsPage} from '../../pages/search-results/search-results';
import {ActionSheetController, ModalController, NavController, Platform, ToastController} from 'ionic-angular';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {PublicProfilePage} from '../../pages/public-profile/public-profile';
import {OrganizationProfilePage} from '../../pages/organization-profile/organization-profile';
import {EventDetailPage} from '../../pages/event-detail/event-detail';
import {RepresentativeProfilePage} from '../../pages/representative-profile/representative-profile';
import {Subject} from "rxjs/Subject";
import {Keyboard} from "@ionic-native/keyboard";
import {UsersProvider} from "../../providers/users/users";
import {AngularFireDatabase} from "angularfire2/database";
import firebase from 'firebase';

@Component({
    selector: 'rally-header',
    templateUrl: 'header.html'
})
export class HeaderComponent {

    organizationPhoto: any = '../assets/img/avatar.png';
    parameter: string;
    testPhoto: any = '../assets/img/avatar.png';
    searching: any = false;
    shouldShowCancel: any = false;
    searchTerm: string = '';
    login:any = true;
    buttonFollowTest:string;
    private searchTerm$: Subject<string>;
    endpoint: string = 'search/';
    followEndpoint: any = 'following_representative';
    currentRallyID: any;
    organizationEndpoint: any = 'following_organizations';
    public currentTabName = 'all';
    public actions: any = [];
    public users: any = [];
    public organizations: any = [];
    public results: any = [];
    public reps: any = [];
    public events: any = [];
    public enablePlaceholder = false;


    constructor(public modalCtrl: ModalController,
                private keyboard: Keyboard,
                private platform: Platform,
                private db: AngularFireDatabase,
                public toastCtrl: ToastController,
                public actionSheetCtrl: ActionSheetController,
                private usersProvider: UsersProvider,
                private httpProvider: OrganizationsProvider,
                public navCtrl: NavController) {
        this.searchTerm$ = new Subject<string>();
        this.results = "all";
        this.platform.ready().then(() => {
            this.usersProvider.returnRallyUserId().then(
                user => {
                    this.currentRallyID = user.apiRallyID;
                    this.checkUserStatus();
                })
        });
    }

    presentResultsPage() {
        let modal = this.modalCtrl.create(SearchResultsPage);
        modal.present();
    }


    checkUserStatus(){
        let user:any = firebase.auth().currentUser;
        if (user) {
            let orgRef = this.db.database.ref('follow/'+user['uid']+'/'+this.parameter);
            orgRef.on('value', snapshot=>{
                if (snapshot.hasChildren()) {
                    console.log('Unfollow');
                    this.buttonFollowTest = 'Following';

                } else{
                    console.log('Follow');
                    this.buttonFollowTest = 'Follow';
                }
            });
        } else{
            this.login = false;
        }
    }

    onSearchInput() {
        if (this.searchTerm === '') {
            this.enablePlaceholder = false;
            this.searching = false;
            this.shouldShowCancel = false;
        } else {
            this.searching = true;
            this.shouldShowCancel = true;
            this.getFilteredData();
        }
        this.actions = [];
        this.users = [];
        this.organizations = [];
        this.reps = [];
        this.events = [];
    }

    getFilteredData() {
        this.searchTerm$.next(this.endpoint + this.searchTerm);
        this.enablePlaceholder = true;
        this.httpProvider.getSubjectJson(this.searchTerm$)
            .subscribe(result => {
                    this.enablePlaceholder = false;
                    this.actions = result['objective'] || [];
                    this.users = result['users'] || [];
                    this.organizations = result['organizations'] || [];
                    this.reps = result['reps'] || [];
                    this.events = result['events'] || [];
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

    followRep(repID, $event) {
        console.log($event);


        this.usersProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentRallyID + '&representative_id=' + repID)
            .subscribe(
                result => {
                    if (result != "") {
                        this.unFollowActionSheet(result[0].id, $event)
                    } else {
                        this.saveRepInApi(repID);
                        $event.srcElement.innerHTML = "Following";
                        $event.srcElement.innerText = "FOLLOWING";
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

    saveRepInApi(repID) {
        this.usersProvider.followRep(this.followEndpoint, this.currentRallyID, repID);
    }

    unFollowActionSheet(representativeID, el) {

        let actionSheet = this.actionSheetCtrl.create({
            title: 'Unfollow this representative?',
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        console.log('Destructive clicked');
                        this.unFollowRep(representativeID);
                        el.srcElement.innerHTML = "Follow";
                        el.srcElement.innerText = "FOLLOW";

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

    unFollowRep(recordID) {
        this.usersProvider.unfollowOrganization(this.followEndpoint, recordID);
    }


    goToPublicProfile(userID) {
        this.navCtrl.push(PublicProfilePage, {
            param1: userID,
            profilePageName: "Search"
        });
    }

    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Search"
        });
    }

    cancel() {
        if (this.platform.is('ios')) {
            this.keyboard.onKeyboardShow().take(1).subscribe(() => {
                this.keyboard.close();
            });
        }

        this.shouldShowCancel = false;
        this.searching = false;
    }

    goToEventDetail(eventID) {
        console.log(eventID);
        this.navCtrl.push(EventDetailPage, {
            eventID: eventID,
            eventPageName: "Search"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    addFollowRecordFirebase(organizationID, $event) {
        let user: any = firebase.auth().currentUser;
        let followRef = this.db.database.ref('organizations/' + user['uid'] + '/' + organizationID);
        followRef.once('value', snapshot => {
            if (snapshot.hasChildren()) {
                console.log('You already follow this org');
                this.unFollowOrgActionSheet(organizationID, $event);

            } else {
                this.followOrg(organizationID, $event);
            }
        });
    }

    addFollowUserRecordFirebase(friendID){
        // let user:any = firebase.auth().currentUser;
        // let followRef = this.db.database.ref('follow/'+user['uid']+'/'+friendID);
        // followRef.once('value', snapshot=>{
        //     if (snapshot.hasChildren()) {
        //         console.log('You already follow this user');
        //         this.unFollowActionSheet();
        //         //this.presentToast('You are not following this user anymore');
        //
        //     }else{
        //         //this.followFriend(friendID);
        //         this.followFriend(friendID);
        //         this.presentToast('Follow user successfully');
        //     }
        // });
    }

    followOrg(organizationID, el) {
        this.usersProvider.followOrganization(this.organizationEndpoint, this.currentRallyID, organizationID);
        el.srcElement.innerText = 'Following';
    }

    unFollowOrgActionSheet(organizationID, el) {

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
        this.usersProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.currentRallyID + '&organization_id=' + organizationID).subscribe(
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
        this.usersProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.usersProvider.removeFollowRecordID(organizationID, 'organizations');
    }
}
