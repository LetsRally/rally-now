import {Component} from '@angular/core';
import {SearchResultsPage} from '../../pages/search-results/search-results';
import {ModalController, NavController, Platform} from 'ionic-angular';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {PublicProfilePage} from '../../pages/public-profile/public-profile';
import {OrganizationProfilePage} from '../../pages/organization-profile/organization-profile';
import {EventDetailPage} from '../../pages/event-detail/event-detail';
import {RepresentativeProfilePage} from '../../pages/representative-profile/representative-profile';
import {Subject} from "rxjs/Subject";
import {Keyboard} from "@ionic-native/keyboard";


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
                private httpProvider: OrganizationsProvider,
                public navCtrl: NavController) {
        this.searchTerm$ = new Subject<string>();
        this.results = "all";
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

    // getdata() {
    //     this.enablePlaceholder = true;
    //     this.httpProvider.getJsonData(this.endpoint + this.searchTerm).subscribe(
    //         result => {
    //             if(result['search'] && result['search'] === this.searchTerm) {
    //                 this.users = result['users'];
    //                 this.organizations = result['organizations'];
    //                 this.reps = result['reps'];
    //                 this.events = result['events'];
    //             }
    //
    //             this.enablePlaceholder = false;
    //         },
    //     err => {
    //         this.enablePlaceholder = false;
    //         console.error("Error : " + err);
    //     },
    //     () => {
    //         this.enablePlaceholder = false;
    //         console.log('getData completed');
    //         });
    // }

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
