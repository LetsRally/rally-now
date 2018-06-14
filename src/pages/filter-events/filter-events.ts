import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {Storage} from '@ionic/storage';
import {Keyboard} from '@ionic-native/keyboard';
import {FilterModel} from "../../models/filter-model";
import {DataProvider} from "../../providers/data/data";
import * as constants from "../../constants/constants";

@IonicPage()
@Component({
    selector: 'page-filter-events',
    templateUrl: 'filter-events.html',
})
export class FilterEventsPage {

    public filterState: FilterModel;
    public invalidZip = false;
    endpoint: any = 'events/';
    enable: boolean = false;
    text: any;
    home: boolean = false;
    orgs: boolean = false;
    events: boolean = false;
    disable: boolean = true;
    public disableButton = false;
    public disableRange = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        private httpProvider: OrganizationsProvider,
        private storage: Storage,
        private keyboard: Keyboard,
        private dataService: DataProvider
    ) {
        this.filterState = new FilterModel();
        this.keyboard.hideKeyboardAccessoryBar(false);

        if (this.navParams.get('location') === 'home') {
            this.home = true;
            this.getStorage('homeFilterState');
        } else if (this.navParams.get('location') === 'orgs') {
            this.orgs = true;
            this.getStorage('orgsFilterState');
        } else {
            this.events = true;
            this.getStorage('eventsFilterState');
        }
    }

    getStorage(key) {
        this.storage.get(key).then((data) => {
            if (data) {
                this.filterState = JSON.parse(data);
                if (data.zipcode && data.zipcode.length >= 5) {
                    this.disable = false;
                }
                this.setDate();
            }
            this.checkZipCode(true);
        });
    }

    setDate() {
        let date = this.dataService.getCurrentDate();

        if (!this.filterState.timeStarts || this.filterState.timeStarts === '') {
            this.filterState.timeStarts = date.currentDate;
        }

        if (!this.filterState.timeEnds || this.filterState.timeEnds === '') {
            this.filterState.timeEnds = date.nextYear;
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FilterEventsPage');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    pop() {
        this.viewCtrl.dismiss('back');
    }

    goToEvents() {
        if (!this.filterState.zipcode || this.filterState.zipcode === '') {
            this.filterState.zipcode = '';
        }

        this.storage.set('eventsFilterState', JSON.stringify(this.filterState));

        this.dismiss();
    }


    getDistance() {
        if (this.filterState.distance > 99) {
            this.text = "ANY DISTANCE";
            this.filterState.distance = 4000;
        } else if (this.filterState.distance < 1) {
            this.text = "< 1 MILE";
        }
        else {
            this.text = this.filterState.distance + ' MILES';
        }
    }

    checkZipCode(firstTime?) {
        if(this.filterState.zipcode === '') {
            this.invalidZip = false;
            this.disableRange = true;
            this.disableButton = false;
            return;
        }
        if (constants.virginZipCodes.indexOf(this.filterState.zipcode) === -1) {
            this.dataService.getZipCodes(this.filterState.zipcode)
                .then((data) => {
                    if (data) {
                        this.invalidZip = false;
                        this.disableButton = false;
                        this.disableRange = false;
                        this.getDistance();
                    } else {
                        this.invalidZip = true;
                        this.disableButton = true;
                        this.disableRange = true;
                    }
                }, (err) => {
                    console.log(err);
                });
            this.invalidZip = true;
            this.disableButton = true;
            this.disableRange = true;
        } else {
            this.invalidZip = false;
            this.disableButton = false;
            this.disableRange = false;
            this.getDistance();
        }
    }

    resetFilter() {
        this.filterState = new FilterModel();
        this.setDate();
        if (!this.filterState.zipcode || this.filterState.zipcode === '') {
            this.filterState.zipcode = '';
        }
        this.storage.set('eventsFilterState', JSON.stringify(this.filterState));
    }
}
