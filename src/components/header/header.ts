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
    testPhoto: any = '../assets/img/avatar.png';
    searching: any = false;
    shouldShowCancel: any = false;
    searchTerm: string = '';
    login:any = true;
    buttonFollowTest:string;
    private searchTerm$: Subject<string>;
    endpoint: string = 'search/';
    followEndpoint: any = 'following_representative';
    followUserEndpoint: string = 'following_users';
    currentRallyID: any;
    organizationEndpoint: any = 'following_organizations';
    private alertsEndpoint: any = 'ux_events';
    private notificationsEndpoint: any = 'devices';
    public currentTabName = 'all';
    public actions: any = [];
    public users: any = [];
    public organizations: any = [];
    public results: any = [];
    public reps: any = [];
    public events: any = [];
    public enablePlaceholder = false;
    private status: boolean;


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
                })
        });
    }

    presentResultsPage() {
        let modal = this.modalCtrl.create(SearchResultsPage);
        modal.present();
    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.currentRallyID;
            });
            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }

    findInLoopUser(data) {
        let user: any = firebase.auth().currentUser;
        let buttonText = 'Follow';
        if (user) {
            let orgRef = this.db.database.ref('follow/' + user['uid'] + '/' + data.id);
            orgRef.on('value', snapshot => {
                if (snapshot.hasChildren()) {
                    buttonText = 'Following';

                } else {
                    buttonText = 'Follow';
                }
            });
        }
        return buttonText;
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



                    this.organizations.map((el) => {
                        console.log('-----');
                        console.log(this.currentRallyID, el['followers']);
                    });
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

    followRep(repID, $event, name) {
        this.usersProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentRallyID + '&representative_id=' + repID)
            .subscribe(
                result => {
                    if (result != "") {
                        this.unFollowActionSheet(result[0].id, $event, name)
                    } else {
                        this.saveRepInApi(repID);
                        $event.srcElement.innerHTML = "Following";
                        $event.srcElement.innerText = "FOLLOWING";
                        $event.srcElement.classList.add('following');
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

    unFollowActionSheet(representativeID, el, name) {

        let actionSheet = this.actionSheetCtrl.create({
            title: `Unfollow ${name}?`,
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
                        el.srcElement.classList.remove('following');
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

    addFollowRecordFirebase(organizationID, $event, name) {
        let user: any = firebase.auth().currentUser;
        let followRef = this.db.database.ref('organizations/' + user['uid'] + '/' + organizationID);
        followRef.once('value', snapshot => {
            if (snapshot.hasChildren()) {
                console.log('You already follow this org');
                this.unFollowOrgActionSheet(organizationID, $event, name);
            } else {
                this.followOrg(organizationID, $event);
            }
        });
    }

    addFollowUserRecordFirebase(friend, $event){
        let user:any = firebase.auth().currentUser;
        let followRef = this.db.database.ref('follow/'+user['uid']+'/'+friend.id);
        followRef.once('value', snapshot=>{
            if (snapshot.hasChildren()) {
                this.unFollowUserActionSheet(friend, $event);
            }else{
                this.followFriend(friend.id, $event);
            }
        });
    }

    unFollowUserActionSheet(friend, el) {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Unfollow ' + friend.name + '?' ,
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        console.log('Destructive clicked');
                        el.srcElement.innerText = 'Follow';
                        el.srcElement.classList.remove('following');
                        this.getFollowRecordID(friend);
                    }
                },{
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

    getFollowRecordID(friend){
        console.log('THIS IS FUCK');
        this.usersProvider.getJsonData(this.followUserEndpoint+'?follower_id='+this.currentRallyID+'&following_id='+friend.id).subscribe(
            result => {
                console.log("Delete User ID : "+ result[0].id);
                this.unFollowFriend(result[0].id, friend);
            },
            err =>{
                console.error("Error : "+err);
            } ,
            () => {
                console.log('getData completed');
            });
    }

    unFollowFriend(recordID, friend) {
        this.usersProvider.unfollowOrganization(this.followUserEndpoint, recordID);
        this.usersProvider.removeFollowRecordID(friend.id, 'follow');
    }

    followFriend(friendID, el){
        this.usersProvider.followFriend(this.followUserEndpoint, this.currentRallyID, friendID, true).subscribe(data => {
            el.srcElement.innerText = 'Following';
            el.srcElement.classList.add('following');
            this.usersProvider.saveFollowRecordID(data.following_id, data.id, 'follow');
            this.getDeviceID(friendID);
        }, error => {
            console.log("Error", error);
        });
    }

    getDeviceID(user_id) {
        console.log("Friend ID", user_id);
        //Reemplazar por parametro despues
        this.usersProvider.getJsonData(this.notificationsEndpoint + '?user_id=' + user_id)
            .subscribe(result => {
                console.log("Devices", result);
                this.saveNotification(user_id, result[0].id, this.currentRallyID);
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
    }

    sendPushNotification(device) {
        this.usersProvider.sendPushNotification(device, 'New Follow Request')
            .subscribe(result => {
                console.log("Noti", result);
            });
    }

    followOrg(organizationID, el) {
        this.usersProvider.followOrganization(this.organizationEndpoint, this.currentRallyID, organizationID);
        el.srcElement.innerText = 'Following';
        el.srcElement.classList.add('following');
    }

    unFollowOrgActionSheet(organizationID, el, name) {

        let actionSheet = this.actionSheetCtrl.create({
            title: `Unfollow ${name}?`,
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        console.log('Destructive clicked');
                        this.getOrganizationFollowRecordID(organizationID);
                        el.srcElement.innerText = 'Follow';
                        el.srcElement.classList.remove('following');
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
