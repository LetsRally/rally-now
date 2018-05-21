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
import {EmailFeedBackPage} from "../email-feed-back/email-feed-back";
import {CallRepPage} from "../call-rep/call-rep";
import {FaxFeedBackPage} from "../fax-feed-back/fax-feed-back";


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


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private httpProvider: UsersProvider,
        private shareProvider: SocialShareProvider,
        public toastCtrl: ToastController,
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
    }


    getRepData(repID) {
        this.httpProvider.getJsonData(this.endpoint + repID).subscribe(result => {
            console.log(result);
            this.representative = result;
            this.name = result.name;
            this.twitter_id = result.twitter_id;
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

    tweetRep(username) {
        this.shareProvider.twitterShare(username);
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
            title: 'Unfollow this representative?',
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
                    browser.insertCss({
                        code: "body, html {padding-top: 20px!important;} header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
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

    shareController(title, imgURI, reference_id, like_type, $event) {
        this.disable = true;

        const actionSheet = this.actionSheetCtrl.create({
            title: 'Share to where?',
            buttons: [
                {
                    text: 'Facebook',
                    handler: () => {
                        this.shareProvider.facebookShare(title, imgURI);
                        this.addShareAction(reference_id, like_type);
                        $event.path[1].lastChild.data++;
                        this.disable = false;
                        this.streakModal();

                    }
                },
                {
                    text: 'Twitter',
                    handler: () => {
                        this.shareProvider.twitterShare(title, imgURI).then(() => {
                            this.addShareAction(reference_id, like_type);
                            $event.path[1].lastChild.data++;
                            this.disable = false;
                            this.streakModal();
                        }).catch((error) => {
                            console.error("shareViaWhatsapp: failed", error);
                            this.disable = false;

                        });


                    }
                },
                //  {
                //   text: 'Copy Link',
                //   handler: () => {
                //     this.disable = false;

                //   }
                // },
                // {
                //   text: 'SMS Message',
                //   handler: () => {
                //     this.disable = false;

                //   }
                // },
                // {
                //   text: 'Email',
                //   handler: () => {

                //     this.disable = false;

                //   }
                // },
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

    streakModal() {
        let modal = this.modalCtrl.create(ThanksPage);
        modal.present();
    }

    addShareAction(goal_id, action_type_id) {
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.currentRallyID);
    }

    tweetRepEllipsisController(name, repID, desc, notify) {
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(name, desc);

                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiersRep(repID);

                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.shareViaEmail();

                    }
                },
                {
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
                this.navCtrl.push(CallRepPage, {rep: rep, repID: repID, offices: offices, user: this.user});
            }
        }];


        if (fax) {
            buttonsArray.push(
                {
                    text: 'Fax',
                    handler: () => {
                        console.log('Fax clicked');
                        this.navCtrl.push(FaxFeedBackPage, {iframeUrl: fax, repID: repID});
                    }
                }
            );
        }

        if (email) {
            buttonsArray.push(
                {
                    text: 'Email',
                    handler: () => {
                        console.log('Email clicked');
                        // this.data.title = 'email';
                        // this.data.action_type_id = 'f9b53bc8-9847-4699-b897-521d8e1a34bb';
                        // this.httpProvider.addAction(this.favEndpoint, this.data);
                        this.navCtrl.push(EmailFeedBackPage, {iframeUrl: email, repID: repID});
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

}
