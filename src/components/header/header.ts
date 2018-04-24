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


@Component({
    selector: 'rally-header',
    templateUrl: 'header.html'
})
export class HeaderComponent {

    testPhoto: any = '../assets/img/avatar.png';
    searching: any = false;
    shouldShowCancel: any = false;
    searchTerm: string = '';
    private searchTerm$: Subject<string>;
    endpoint: string = 'search/';
    followEndpoint: any = 'following_representative';
    currentRallyID: any;
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
        this.presentToast('Representative added');
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
        this.presentToast('Representative removed');
    }

    presentToast(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000
        });
        toast.present();
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


}
