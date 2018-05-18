import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {PublicProfilePage} from '../public-profile/public-profile';
import {Keyboard} from "@ionic-native/keyboard";


@IonicPage()
@Component({
    selector: 'page-organization-followers',
    templateUrl: 'organization-followers.html',
})
export class OrganizationFollowersPage {

    endpoint: any = 'organization/';
    followers: any;
    items: any;
    public enablePlaceholder = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private platform: Platform,
        private keyboard: Keyboard,
        private httpProvider: OrganizationsProvider) {
        this.enablePlaceholder = true;
        this.getFollowers(navParams.get('orgID'));
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OrganizationFollowersPage');
    }

    getFollowers(orgID) {
        this.httpProvider.getJsonData(this.endpoint + orgID).subscribe(result => {
            this.followers = result['organization'][0].followers || [];
            this.initializeItems();
            this.enablePlaceholder = false;
            console.log(result['organization'][0].followers);
        });
    }

    initializeItems() {
        this.items = this.followers;
    }

    getItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;

        if(val === '') {
            return;
        }

        if (val && val.trim() != '') {
            this.items = this.items.filter((item) => {
                if(!item.name || !item.name.length) {
                    return false;
                }
                return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        }
    }

    goToPublicProfile(userID) {
        this.navCtrl.push(PublicProfilePage, {
            param1: userID,
            profilePageName: "Organization"
        });
    }

    cancel() {
        if (this.platform.is('ios')) {
            this.keyboard.onKeyboardShow().take(1).subscribe(() => {
                this.keyboard.close();
            });
        }
    }
}
