import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ToastController,
    ActionSheetController,
    ModalController
} from 'ionic-angular';
import {UsersProvider} from '../../providers/users/users';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {RepFollowersPage} from '../rep-followers/rep-followers';
import {ThanksPage} from '../thanks/thanks';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';
import {CallStatePage} from "../call-state/call-state";
import {ThankYouPage} from "../thank-you/thank-you";
import {Storage} from '@ionic/storage';
import {IssueScreenPage} from "../issue-screen/issue-screen";
import {PhotoViewer} from "@ionic-native/photo-viewer";


@IonicPage()
@Component({
    selector: 'page-representative-profile',
    templateUrl: 'representative-profile.html',
})
export class RepresentativeProfilePage {

    data:any = [{
        user_id: '',
        title: '',
        short_desc: '',
        representative_id: '',
        action_type_id: ''
    }];
    endpoint: any = 'reps/';
    name: any;
    twitter_id: any;
    twitter_link: any;
    followers_count: any;
    description: any;
    photo_url: any;
    currentRallyID: any;
    followEndpoint: any = 'following_representative';
    repID: any;
    followers: any;
    post_count: any;
    posts: any;
    likeendpoint: any = 'likes';
    disable: boolean = false;
    tweetLike: any = 'ab860ccb-9713-49e5-b844-34d18f92af21';
    favEndpoint: any = 'actions';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    isFollowing: boolean = false;
    private representative: any;
    private user: any;
    private userEmail = '';
    private userName = '';
    private userPhone = '';


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private httpProvider: UsersProvider,
        private shareProvider: SocialShareProvider,
        public toastCtrl: ToastController,
        private storage: Storage,
        private photoViewer: PhotoViewer,
        private themeableBrowser: ThemeableBrowser,
        public actionSheetCtrl: ActionSheetController,
        public modalCtrl: ModalController) {
        this.getRepData(navParams.get('repID'));
        this.httpProvider.returnRallyUserId().then(
            user => {
                this.currentRallyID = user.apiRallyID;
                this.user = user;
                this.data.user_id = user.apiRallyID;
            });
        this.storage.get('EMAIL').then((res) => {
            this.userEmail = res;
        });
        this.storage.get('USER_PHONE').then((res) => {
            this.userPhone = res || '';
        });
        this.storage.get('DISPLAYNAME').then((res) => {
            this.userName = res;
        });
    }


    getRepData(repID) {
        this.httpProvider.getJsonData(this.endpoint + repID).subscribe(result => {
            console.log(result);
            this.representative = result;
            this.name = result.name;
            this.twitter_id = result.twitter_id;
            this.twitter_link = result.twitter_link;
            this.followers_count = result.followers_count;
            this.description = result.description;
            this.photo_url = result.photo_url;
            this.repID = result.id;
            this.data.representative_id = result.id;
            this.followers = result.followers;
            this.post_count = result.post_count;
            this.posts = result.posts;

            this.followers.some(el => {
                if (el == this.currentRallyID) {
                    this.isFollowing = true;
                }

            });
        });
    }

    showPhotoViewer(path) {
        this.photoViewer.show(path);
    }

    getLikeStatus($event, reference_id, like_type, likes) {
        this.disable = true;

        this.httpProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.currentRallyID).subscribe(
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
        this.httpProvider.addLike(this.likeendpoint, reference_id, this.currentRallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }

    removeFav(recordID) {
        this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
        this.httpProvider.removeFollowRecordID(recordID, 'favorites');

    }

    tweetRep(link) {
        const options = constants.themeAbleOptions;
        const browser = this.themeableBrowser.create(link, '_blank', options);

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


    followRep(repID, $event) {
        console.log($event);


        this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentRallyID + '&representative_id=' + repID)
            .subscribe(
                result => {

                    if (result != "") {
                        this.unFollowRep(result[0].id, $event.srcElement);

                    } else {
                        this.saveRepInApi(repID);
                        $event.srcElement.innerHTML = "Following";
                        $event.srcElement.innerText = "FOLLOWING";
                        this.isFollowing = true;
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
        this.httpProvider.followRep(this.followEndpoint, this.currentRallyID, repID);
    }


    unFollowRep(recordID, el) {
        let actionSheet = this.actionSheetCtrl.create({
            title: `Unfollow ${this.name}?`,
            cssClass: 'title-img',
            buttons: [
                {
                    text: 'Unfollow',
                    role: 'destructive',
                    handler: () => {
                        el.innerHTML = "Follow";
                        el.innerText = "FOLLOW";
                        this.httpProvider.unfollowOrganization(this.followEndpoint, recordID);
                        this.isFollowing = false;
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

    getIcon(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.currentRallyID;

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
                return el == this.currentRallyID;

            });

            if (!found) {
                return '#b6b6b6';

            } else {
                return '#f2f2f2';

            }
        }

    }


    findInLoopColor(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.currentRallyID;

            });

            if (!found) {
                return '#f2f2f2';

            } else {
                return '#296fb7';

            }
        }

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

    goToFollowers() {
        this.navCtrl.push(RepFollowersPage, {
            repID: this.repID
        });
    }

    shareController(title, imgURI, tweetImage) {
        let imgUrl = imgURI;
        if (tweetImage && tweetImage !== '') {
            imgUrl = tweetImage;
        }
        this.disable = true;
        this.shareProvider.otherShare(title, 'MESSAGE---', imgUrl, constants.appStoreUrl)
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
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.currentRallyID);
    }

    tweetRepEllipsisController(name, repID, desc, notify, imgURI, tweetImage) {
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

    notifyExist(actions) {
        console.log("IDs", actions);
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.currentRallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiersRep(repID) {
        this.httpProvider.getJsonData(this.followEndpoint + '?user_id=' + this.currentRallyID + '&representative_id=' + repID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.httpProvider.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.httpProvider.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }

    contact() {
        this.presentActionSheet();
    }

    presentActionSheet() {
        let rep = this.representative,
            fax = this.representative.fax_url,
            twitter = this.representative.twitter_id,
            repID = this.representative.id,
            email = this.representative.contact_form,
            offices = this.representative.offices;

        let buttonsArray = [{
            text: 'Call',
            handler: () => {
                this.navCtrl.push(CallStatePage, {rep: rep, repID: repID, offices: offices, user: this.user, parentView: 'repProfile'});
            }
        }];

        if (fax) {
            buttonsArray.push(
                {
                    text: 'Fax',
                    handler: () => {
                        this.doFax();
                    }
                }
            );
        }

        if (email) {
            buttonsArray.push(
                {
                    text: 'Email',
                    handler: () => {
                        this.doEmail();
                    }
                }
            )
        }

        if (twitter) {
            buttonsArray.push(
                {
                    text: 'Post message via Twitter',
                    handler: () => {
                        console.log('Post message via Twitter clicked');

                        this.shareProvider.twitterShare('@' + twitter).then(() => {
                            this.data.title = 'tweet';
                            this.data.action_type_id = '9eef1652-ccf9-449a-901e-ad6c0b3a8a6c';
                            this.httpProvider.addAction(this.favEndpoint, this.data);
                            this.streakModal();
                        });
                    }
                }
            )
        }


        buttonsArray[buttonsArray.length] = {
            text: 'Cancel',
            // role: 'cancel',
            handler: () => {
                console.log('Cancel clicked');
            }
        };

        let actionSheet = this.actionSheetCtrl.create({
            title: 'Contact ' + rep.name,
            buttons: buttonsArray
        });
        actionSheet.present();
    }

    doEmail() {
        console.log('this.representative.contact_form');
        console.log(this.representative.contact_form);
        const options = constants.themeAbleOptions;
        const browser = this.themeableBrowser.create(this.representative.contact_form, '_blank', options);

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
            this.emailFeedback();
        })
    }

    emailFeedback() {
        let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackEmailRows});
        modal.onDidDismiss((data) => {
            switch (data.actionId) {
                case 1: {
                    this.streakEmailModal();
                    this.addEmailAction();
                }
                    break;

                case 2: {
                    this.errorModal();
                }
            }
        });
        modal.present();
    }

    streakEmailModal() {
        let repTitle = this.representative.rep_type === 'sen' ? 'senator' : 'representative';
        let data = {
            titleForShare: `I used Rally to email ${repTitle} ${this.representative.name}`,
            imgURI: this.representative.photo_url
        };

        let modal = this.modalCtrl.create(ThankYouPage, data);
        modal.present();
    }

    addEmailAction() {
        let data = {
            representative_id: this.repID,
            action_type_id: 'f9b53bc8-9847-4699-b897-521d8e1a34bb',
            title: 'email',
            user_id: this.currentRallyID
        };
        this.httpProvider.addAction('actions', data);
    }

    doFax() {
        console.log('this.representative.fax_url');
        console.log(this.representative.fax_url);
        const options = constants.themeAbleOptions;
        const that = this;
        const browser = this.themeableBrowser.create(this.representative.fax_url, '_blank', options);

        browser.on("loadstop")
            .subscribe(
                () => {
                    browser.insertCss({
                        code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
                    });

                    if (this.representative.fax_url.indexOf('https://faxzero.com/') !== -1) {
                        browser.executeScript({
                            code: 'document.getElementById("input-fax_s_name").value = "' + that.userName + '";' +
                            ' document.getElementById("input-fax_s_email").value = "' + that.userEmail + '";' +
                            ' document.getElementById("input-fax_s_phone").value = "' + that.userPhone + '";' +
                            ' document.body.style.paddingTop = "50px"'
                        }).then((r) => {
                        }).catch((err) => {
                            console.log('EXECUTE ERROR');
                            console.log(err);
                        })
                    }
                },
                err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                });

        browser.on('closePressed').subscribe(data => {
            browser.close();
            this.faxFeedback();
        })
    }

    faxFeedback() {
        let modal = this.modalCtrl.create('FeedbackModalComponent', {rows: constants.feedbackFaxRows});
        modal.onDidDismiss((data) => {
            switch (data.actionId) {
                case 1: {
                    this.streakFaxModal();
                    this.addAction();
                }
                    break;

                case 2: {
                    this.errorModal();
                }
            }
        });
        modal.present();
    }

    streakFaxModal() {
        let repTitle = this.representative.rep_type === 'sen' ? 'senator' : 'representative';
        let data = {
            titleForShare: `I used Rally to fax ${repTitle} ${this.representative.name}`,
            imgURI: this.representative.photo_url
        };

        let modal = this.modalCtrl.create(ThankYouPage, data);
        modal.present();
    }

    addAction() {
        let data = {
            representative_id: this.repID,
            action_type_id: 'ad3ef19b-d809-45b7-bef2-d470c9af0d1d',
            title: 'fax',
            user_id: this.currentRallyID
        };
        this.httpProvider.addAction('actions', data);
    }

    errorModal() {
        let modal = this.modalCtrl.create(IssueScreenPage);
        modal.onDidDismiss((val) => {
            let params = {
                animate: true,
                animation: 'transition',
                duration: 500,
                direction: 'back'
            };

            if (!val || !val.close) {
                this.navCtrl.popTo(this.navCtrl.getByIndex(0), params);
                this.navCtrl.parent.select(0);
            }
        });
        modal.present();
    }

}
