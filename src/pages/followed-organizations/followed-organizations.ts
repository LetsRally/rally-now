import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {PopoverController} from 'ionic-angular';
import {OverlayPage} from '../overlay/overlay'
import {UsersProvider} from '../../providers/users/users';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {PublicProfilePage} from '../public-profile/public-profile';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
    selector: 'page-followed-organizations',
    templateUrl: 'followed-organizations.html',
})
export class FollowedOrganizationsPage {
    endpoint: any = 'following/';
    currentApiID: any;
    organizations = [];
    items: any;
    loading: any;
    users = [];
    reps = [];
    safeSvg: any;
    organizationEndpoint = 'following_organizations';
    followEndpoint = 'following_representative';
    followUserEndpoint = 'following_users';
    enablePlaceholder = false;
    testPhoto = 'assets/img/event.png';


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public popoverCtrl: PopoverController,
                private httpProvider: UsersProvider,
                private modalCtrl: ModalController,
                public loadingCtrl: LoadingController,
                private orgProvider: OrganizationsProvider,
                private storage: Storage) {


    }

    ionViewDidEnter() {
        this.storage.get('followedItemsFromProfile').then((data) => {
            console.log('000000000');
            console.log(data);
            if(!data) {
                this.getOrganizations();
            } else {
                this.setDataFromStorage(data);
            }
        });
        this.httpProvider.returnRallyUserId().then(
            user => {
                this.currentApiID = user.apiRallyID;
            }
        );
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FollowedOrganizationsPage');
    }

    setDataFromStorage(data) {
        this.organizations = data['organizations'];
        this.users = data['users'];
        this.reps = data['reps'];
    }

    getOrganizations() {
        this.enablePlaceholder = true;
        this.orgProvider.getJsonData(this.endpoint + this.currentApiID)
            .subscribe(
                result => {
                    this.organizations = result['organizations'];
                    this.users = result['users'];
                    this.reps = result['reps'];
                    this.enablePlaceholder = false;
                    this.setStorage();
                }
            );
    }

    setStorage() {
        let data = {
            organizations: this.organizations,
            users: this.users,
            reps: this.reps
        };
        this.storage.set('followedItemsFromProfile', data);
    }

    initializeItems() {
        this.items = this.organizations;
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

    getItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.items = this.items.filter((item) => {
                return (item.followers[0].name.toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        }
    }

    goToPublicProfile(userID) {
        this.navCtrl.push(PublicProfilePage, {
            param1: userID,
            profilePageName: "Following"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Following"
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


    getOrganizationFollowRecordID(orgID, $event) {

        let data = {
            text: "Are you shure?",
            title: "Warning!",
            buttonsNames: ['Cancel', 'Continue']
        };
        let modal = this.modalCtrl.create('ModalWindowComponent', data);
        modal.onDidDismiss(data => {
            if (data && data.access) {
                this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.currentApiID + '&organization_id=' + orgID).subscribe(
                    result => {
                        if (result != "") {
                            this.unfollow(result[0].id, orgID);
                            $event.srcElement.innerText = "FOLLOW";
                            $event.srcElement.classList.remove('following');
                        } else {
                            this.followOrg(orgID, $event);
                        }
                    },
                    err => {
                        console.error("Error : " + err);
                    },
                    () => {
                        console.log('getData completed');
                    });
            }
        });
        modal.present();
    }

    followOrg(organizationID, el) {
        this.httpProvider.followOrganization(this.organizationEndpoint, this.currentApiID, organizationID);
        el.srcElement.innerText = 'Following';
        el.srcElement.classList.add('following');
    }

    unfollow(recordID, orgID) {

        this.httpProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(orgID, 'organizations');
    }


    followRep(repID, $event) {
        let data = {
            text: "Are you shure?",
            title: "Warning!",
            buttonsNames: ['Cancel', 'Continue']
        };
        let modal = this.modalCtrl.create('ModalWindowComponent', data);
        modal.onDidDismiss(data => {
            if (data && data.access) {
                this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentApiID + '&representative_id=' + repID)
                    .subscribe(
                        result => {

                            if (result != "") {
                                this.unFollowRep(result[0].id);
                                $event.srcElement.innerHTML = "Follow";
                                $event.srcElement.innerText = "FOLLOW";
                                $event.srcElement.classList.remove('following');
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
        });
        modal.present();
    }

    saveRepInApi(repID) {
        this.httpProvider.followRep(this.followEndpoint, this.currentApiID, repID);


    }

    unFollowRep(recordID) {
        this.httpProvider.unfollowOrganization(this.followEndpoint, recordID);
    }


    getFollowRecordID(userID, $event) {

        let data = {
            text: "Are you shure?",
            title: "Warning!",
            buttonsNames: ['Cancel', 'Continue']
        };
        let modal = this.modalCtrl.create('ModalWindowComponent', data);
        modal.onDidDismiss(data => {
            if (data && data.access) {
                this.httpProvider.getJsonData(this.followUserEndpoint + '?follower_id=' + this.currentApiID + '&following_id=' + userID).subscribe(
                    result => {
                        if (result && result != "" && result.length) {
                            this.unFollowFriend(result[0].id, userID);
                            $event.srcElement.innerHTML = "Follow";
                            $event.srcElement.innerText = "FOLLOW";
                            $event.srcElement.classList.remove('following');
                        } else {
                            $event.srcElement.innerHTML = "Following";
                            $event.srcElement.innerText = "FOLLOWING";
                            $event.srcElement.classList.add('following');
                        }


                        this.unFollowFriend(result[0].id, userID);
                        $event.srcElement.innerHTML = "Follow";
                        $event.srcElement.innerText = "FOLLOW";
                        $event.srcElement.classList.remove('following');
                    },
                    err => {
                        console.error("Error : " + err);
                    },
                    () => {
                        console.log('getData completed');
                    }
                );
            }
        });
        modal.present();
    }

    unFollowFriend(recordID, userID) {
        this.httpProvider.unfollowOrganization(this.followUserEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(userID, 'follow');
    }

}
 