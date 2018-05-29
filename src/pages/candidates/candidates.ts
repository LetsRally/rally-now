import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ViewController,
    ActionSheetController,
    ModalController,
    ToastController
} from 'ionic-angular';
import {PopoverController} from 'ionic-angular';
import {OrganizationsProvider} from '../../providers/organizations/organizations';
import {UsersProvider} from '../../providers/users/users';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import {ThanksPage} from '../thanks/thanks';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {DomSanitizer} from '@angular/platform-browser';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';


@IonicPage()
@Component({
    selector: 'page-candidates',
    templateUrl: 'candidates.html',
})
export class CandidatesPage {

    endpoint: any = 'my_representatives/';
    myRallyID: any;
    public records: any = [];
    private start: number = 1;
    likeendpoint: any = 'likes';
    tweetLike: any = 'ab860ccb-9713-49e5-b844-34d18f92af21';
    favEndpoint: any = 'actions';
    disable: boolean = false;
    organizationEndpoint: any = 'following_organizations';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    loader: boolean = false;
    enablePlaceholder: boolean = true;
    followEndpoint: any = 'following_representative';


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public popoverCtrl: PopoverController,
        public viewCtrl: ViewController,
        private httpProvider: OrganizationsProvider,
        private userProv: UsersProvider,
        public actionSheetCtrl: ActionSheetController,
        private shareProvider: SocialShareProvider,
        public modalCtrl: ModalController,
        private sanitizer: DomSanitizer,
        private themeableBrowser: ThemeableBrowser,
        public toastCtrl: ToastController
    ) {
        this.enablePlaceholder = true;

        this.userProv.returnRallyUserId().then(user => {
            this.myRallyID = user.apiRallyID;
            this.getdata();
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CandidatesPage');
    }

    getdata() {


        return new Promise(resolve => {
            this.httpProvider.loadHome(this.endpoint + this.myRallyID + '/', this.start)
                .then(data => {
                    console.log("rep Tweets", data);
                    this.getArray(data['Reps_Tweets']);

                    resolve(true);
                    this.enablePlaceholder = false;
                    this.loader = false;

                });
        });
    }

    getArray(array) {
        // console.log(array);
        for (let person of array) {
            // console.log(person);
            this.records.push(person);
            // console.log("Records", this.records);
        }

    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myRallyID;

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
                return el == this.myRallyID;

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
                return el == this.myRallyID;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    tweetRepEllipsisController(name, repID, desc, followers, notify, imgURI, tweetImage) {
        let imgUrl = imgURI;
        if (tweetImage && tweetImage !== '') {
            imgUrl = tweetImage;
        }
        this.disable = true;

        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(desc, 'MESSAGE---', imgUrl, constants.appStoreUrl)
                            .then(() => {
                                this.disable = false;
                            }, err => {
                                this.disable = false;
                                console.log(err);
                            })
                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiersRep(repID);
                        this.disable = false;
                    }
                },
                {
                    text: this.findInLoopTweet(followers) + ' ' + name,
                    handler: () => {
                        this.followRep(repID);
                        console.log("test");
                        this.disable = false;
                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.shareViaEmail();
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

    followRep(repID) {


        this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.myRallyID + '&representative_id=' + repID)
            .subscribe(
                result => {

                    if (result != "") {
                        this.unFollowRep(result[0].id);

                    } else {
                        this.saveRepInApi(repID);

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
        this.userProv.followRep(this.followEndpoint, this.myRallyID, repID);


    }

    unFollowRep(recordID) {
        this.userProv.unfollowOrganization(this.followEndpoint, recordID);
    }


    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    openWebpage(username, tweetID) {
        var url: string = 'https://twitter.com/' + username + '/status/' + tweetID;
        const options = constants.themeAbleOptions;
        const browser = this.themeableBrowser.create(url, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.executeScript({
                        code: 'document.body.style.paddingTop = "50px"'
                    })
                },
                err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                });

        browser.on('closePressed').subscribe(data => {
            browser.close();
        })
    }

    getLikeStatus($event, reference_id, like_type, likes) {
        this.disable = true;

        this.userProv.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myRallyID).subscribe(
            result => {
                console.log($event);
                console.log("Aqui", $event.srcElement.lastChild.data);

                if (result != "") {
                    this.removeFav(result[0].id);
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
        this.userProv.addLike(this.likeendpoint, reference_id, this.myRallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }

    removeFav(recordID) {
        this.userProv.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
        this.userProv.removeFollowRecordID(recordID, 'favorites');

    }

    shareController(title, imgURI, reference_id, like_type, $event) {
        this.disable = true;
        this.shareProvider.otherShare(title, 'MESSAGE---', imgURI, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            }, err => {
                console.log(err);
                this.disable = false;
            })
    }

    streakModal() {
        let modal = this.modalCtrl.create(ThanksPage);
        modal.present();
    }

    addShareAction(goal_id, action_type_id) {
        this.userProv.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myRallyID);
    }

    findInLoopTweet(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myRallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }

    }


    unfollowOrg(recordID, orgID) {

        this.userProv.unfollowOrganization(this.organizationEndpoint, recordID);
        this.userProv.removeFollowRecordID(orgID, 'organizations');
    }

    followOrg(organizationID) {
        this.userProv.followOrganization(this.organizationEndpoint, this.myRallyID, organizationID);

    }

    doRefresh(refresher) {
        this.records = [];
        // this.loading = this.loadingCtrl.create({
        //   spinner: 'hide',
        //   content: this.safeSvg,
        //   });
        //   this.loading.present();
        this.loader = true;
        this.getdata();

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    notifyExist(actions) {
        console.log("IDs", actions);
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myRallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiersRep(repID) {
        this.userProv.getJsonData(this.followEndpoint + '?user_id=' + this.myRallyID + '&representative_id=' + repID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.userProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.userProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }


}
