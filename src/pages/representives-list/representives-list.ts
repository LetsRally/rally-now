import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController, Platform, ActionSheetController} from 'ionic-angular';
import {UsersProvider} from '../../providers/users/users';
import {Storage} from '@ionic/storage';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {FormControl} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from "rxjs/Subject";


@IonicPage()
@Component({
    selector: 'page-representives-list',
    templateUrl: 'representives-list.html',
})
export class RepresentivesListPage {
    endpoint: any = 'reps';
    representatives: any = [];
    public enableInfiniteScroll = true;
    loading: any;
    items: any = [];
    currentRallyID: any;
    followEndpoint: any = 'following_representative';
    newEndpoint: any = 'reps_pagination/';
    private start: number = 1;
    searchControl: FormControl;
    shouldShowCancel: any = false;
    searchTerm: string = '';
    private searchTerm$: Subject<string>;
    safeSvg: any;
    enablePlaceholder: boolean = true;


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private httpProvider: UsersProvider,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                private storage: Storage,
                private platform: Platform,
                private orgProvider: OrganizationsProvider,
                public actionSheetCtrl: ActionSheetController,
                private sanitizer: DomSanitizer) {

        this.searchControl = new FormControl();
        this.searchTerm$ = new Subject<string>();
        this.platform.ready().then(() => {
            this.httpProvider.returnRallyUserId().then(
                user => {
                    this.currentRallyID = user.apiRallyID;
                    this.getReps();
                })
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FriendsRequestPage');
        this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
            this.shouldShowCancel = false;
        });

    }

    getReps() {
        return new Promise(resolve => {
            this.orgProvider.load(this.newEndpoint, this.start)
                .then(data => {
                    this.getArray(data);
                    resolve(true);
                });
        });
    }

    getArray(array) {
        for (let person of array) {
            this.items.push(person);
        }
        this.enablePlaceholder = false;
    }


    doInfinite(infiniteScroll: any) {
        this.start += 1;
        this.getReps().then(() => {
            infiniteScroll.complete();
        });

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
                return el == this.currentRallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }

    unFollowRep(recordID) {
        this.httpProvider.unfollowOrganization(this.followEndpoint, recordID);
        this.presentToast('Representative removed');
    }

    followRep(repID, $event) {
        console.log($event);


        this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentRallyID + '&representative_id=' + repID)
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


      unFollowActionSheet(representativeID, el) {
        
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Unfollow this representative?' ,
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

    saveRepInApi(repID) {
        this.httpProvider.followRep(this.followEndpoint, this.currentRallyID, repID);
        this.presentToast('Representative added');


    }

    presentToast(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000
        });
        toast.present();
    }

    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID});
    }

    getFilteredData() {
        this.searchTerm$.next(this.endpoint + '/search/' + this.searchTerm);

        this.orgProvider.getSubjectJson(this.searchTerm$)
            .subscribe(result => {
                    this.enablePlaceholder = false;
                    this.items = result['reps'];
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
        console.log("Busqueda", this.searchTerm);
        if (this.searchTerm === "") {
            this.start = 1;
            this.items = [];
            this.shouldShowCancel = false;
            this.enablePlaceholder = true;
            this.enableInfiniteScroll = true;
            this.getReps();
        } else {
            this.shouldShowCancel = true;
            this.items = [];
            this.enablePlaceholder = true;
            this.enableInfiniteScroll = false;
            this.getFilteredData();
        }

    }

    cancel() {
        this.start = 1;
        this.items = [];
        this.enablePlaceholder = true;
        this.enableInfiniteScroll = true;
        this.getReps();
    }


}
