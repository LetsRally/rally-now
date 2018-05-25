import {Component} from '@angular/core';
import {
    IonicPage,
    ViewController,
    NavController,
    NavParams,
    ToastController,
    ActionSheetController,
    ModalController
} from 'ionic-angular';
import {UsersProvider} from '../../providers/users/users';
import {AngularFireDatabase} from 'angularfire2/database';
import firebase from 'firebase';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import {CallPage} from '../call/call';
import {WebviewPage} from '../webview/webview';
import {Storage} from '@ionic/storage';
import {AdressModalPage} from '../adress-modal/adress-modal';
import {ThankYouPage} from '../thank-you/thank-you';
import {FaxFeedBackPage} from '../fax-feed-back/fax-feed-back';
import {EmailFeedBackPage} from '../email-feed-back/email-feed-back';
import {OrganizationProfilePage} from '../organization-profile/organization-profile';
import {ThanksPage} from '../thanks/thanks';
import {RepresentativeProfilePage} from '../representative-profile/representative-profile';
import * as constants from '../../constants/constants';

@IonicPage()
@Component({
    selector: 'page-organization-action',
    templateUrl: 'organization-action.html',
})
export class OrganizationActionPage {
    endpoint: string = 'objectives/';
    favEndpoint: any = 'actions';
    organizationEndpoint: any = 'following_organizations';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    orgName: string;
    orgDescription: string;
    organizationID: any;
    objectiveID: any;
    objTitle: string;
    rallies: string;
    myrallyID: any;
    shares: any;
    likes: any;
    actions: any;
    goal_id: any;
    buttonColor: any;
    shownGroup = null;
    shownGroups = [];
    date: any;
    pageName: any;
    objectivesMedia: any;
    objDesc: any;
    objShort: any;
    orgPhoto: any;
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    information = [];
    enable: boolean;
    disable: boolean = false;
    message: boolean = false;

    goalLike: any = 'ea9bd95e-128c-4a38-8edd-938330ad8b2d';
    likeendpoint: any = 'likes';
    reps: any;
    repAddress: any;
    repsEndpoint: any = 'reps?bioguide=';
    data: any = [{
        user_id: '',
        title: '',
        short_desc: '',
        representative_id: '',
        action_type_id: '',
        goal_id: ''
    }];
    senators: any;
    contactOption: any;
    enableReps: boolean;
    enableSen: boolean;
    enableSpecificRep: boolean;
    reps_goals: any;
    objective: any;


    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private httpProvider: UsersProvider,
                public toastCtrl: ToastController,
                private db: AngularFireDatabase,
                private shareProvider: SocialShareProvider,
                public actionSheetCtrl: ActionSheetController,
                public viewCtrl: ViewController,
                private storage: Storage,
                public modalCtrl: ModalController) {
        this.objectiveID = navParams.get('objectiveID');
        this.pageName = navParams.get('pageName');
        this.httpProvider.returnRallyUserId()
            .then(user => {
                console.log(" Usuario", user);
                this.myrallyID = user.apiRallyID;
                this.data.user_id = user.apiRallyID;
                this.data.title = 'tweet';
                this.getdata();
                this.getReps();

            });

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OrganizationActionPage');

    }

    presentActionSheet(rep, fax, twitter, email, repID, offices) {
        let buttonsArray = [{
            text: 'Call',
            handler: () => {
                this.navCtrl.push(CallPage, {
                    rep: rep,
                    repID: repID,
                    talkingPoints: this.objShort,
                    offices: offices,
                    goalID: this.goal_id,
                    objectiveID: this.objectiveID,
                    yourRep: this.enableSpecificRep
                });
            }
        }];


        if (fax && fax !== '') {
            buttonsArray.push(
                {
                    text: 'Fax',
                    handler: () => {
                        console.log('Fax clicked');
                        this.navCtrl.push(FaxFeedBackPage, {
                            rep: rep,
                            iframeUrl: fax,
                            repID: repID,
                            goalID: this.goal_id,
                            objectiveID: this.objectiveID
                        });

                    }
                }
            );
        }

        if (email && email !== '') {
            buttonsArray.push(
                {
                    text: 'Email',
                    handler: () => {
                        console.log('Email clicked');
                        this.navCtrl.push(EmailFeedBackPage, {
                            iframeUrl: email,
                            repID: repID,
                            goalID: this.goal_id,
                            objectiveID: this.objectiveID,
                            rep: rep
                        });
                    }
                }
            )
        }

        if (twitter && twitter !== '') {
            buttonsArray.push(
                {
                    text: 'Post message via Twitter',
                    handler: () => {
                        console.log('Post message via Twitter clicked');

                        this.shareProvider.twitterShare('@' + twitter).then(() => {
                            this.data.action_type_id = '9eef1652-ccf9-449a-901e-ad6c0b3a8a6c';
                            this.data.goal_id = this.goal_id;
                            this.httpProvider.addAction(this.favEndpoint, this.data);

                            let data = {
                                titleForShare: `I used Rally to tweet ${rep.title} ${rep.first_name} ${rep.last_name}`,
                                imgURI: rep.photo_url
                            };
                            this.streakModal(data);
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

    streakModal(data) {
        let modal = this.modalCtrl.create(ThanksPage, data);
        modal.present();
    }

    getdata() {
        this.httpProvider.getJsonData(this.endpoint + this.objectiveID).subscribe(
            result => {
                this.objective = result;
                this.orgName = result.organization['name'];
                this.objTitle = result.title;
                this.orgPhoto = result.organization['image_url'];
                this.orgDescription = result.organization['description'];
                this.organizationID = result.organization_id;
                this.rallies = result.rallies;
                this.goal_id = result.goals[0]['id'];
                this.likes = result.likes;
                this.shares = result.shares;
                this.actions = result.goals[0];
                this.date = result.release_date;
                this.objectivesMedia = result.image_url;
                this.objDesc = result.description;
                this.objShort = result.short_desc;
                this.information.push(
                    {
                        title: "Why it's important",
                        description: this.objDesc
                    },
                    {
                        title: "What to say (talking points)",
                        description: this.objShort
                    });

                this.reps_goals = result.goals[0].reps_goals;
                this.contactOption = result.goals[0].contact_option_id;
                if (result.goals[0].contact_option_id === '5ab2a2d5-776c-4364-b7c7-9760b185268e') {
                    this.enableSen = true;
                } else if (result.goals[0].contact_option_id === 'b93168cb-3edb-4b06-92fb-65029e6deea0') {
                    this.enableReps = true;
                } else if (result.goals[0].contact_option_id === '081e67ea-ac08-4d6e-b91c-17efe265be06') {
                    this.enableReps = true;
                    this.enableSen = true;
                } else if (result.goals[0].contact_option_id === '40c652e4-bf45-4680-8223-b0b0cf8a92ba') {
                    this.enableSpecificRep = true;
                }

                console.log("Actions", JSON.stringify(this.actions));
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            }
        );
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


    share(title, imgURI) {
        this.shareProvider.otherShare(title, imgURI);
    }


    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myrallyID;

            });

            if (!found) {
                return '#f2f2f2';

            } else {
                return '#296fb7';

            }
        }

    }


    toggleGroup(group) {
        if (this.isGroupShown(group)) {
            let groupId = this.shownGroups.indexOf(group);
            this.shownGroups.splice(groupId, 1);
        } else {
            this.shownGroups.push(group);
        }
    };

    isGroupShown(group) {
        return this.shownGroups.indexOf(group) > -1;
    };


    getLikeStatus($event, reference_id, like_type) {
        this.disable = true;
        this.httpProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myrallyID).subscribe(
            result => {
                console.log("Aqui", result);

                if (result != "") {
                    this.removeFav(result[0].id);
                    $event.srcElement.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.lastChild.data--;

                } else {
                    this.addLike(reference_id, like_type);
                    $event.srcElement.style.backgroundColor = '#296fb7';
                    $event.srcElement.offsetParent.style.backgroundColor = '#296fb7';
                    $event.srcElement.lastChild.data++;
                }
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            });
    }

    addLike(reference_id, like_type) {
        this.httpProvider.addLike(this.likeendpoint, reference_id, this.myrallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }


    shareController() {
        this.disable = true;

        this.shareProvider.otherShare(this.objTitle, 'MESSAGE---', this.orgPhoto, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            }, err => {
                console.log(err);
                this.disable = false;
            })
    }

    addShareAction(goal_id, action_type_id) {
        this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myrallyID);
    }


    getReps() {
        this.storage.get('representatives').then((val) => {
            console.log(val);
            console.log(val, 'representatives');
            if (val != null) {
                this.enable = true;
                if (val !== 'sorry') {
                    this.reps = val;
                    this.getAddress();
                    this.getSenator();
                    this.message = false;
                } else {
                    this.message = true;

                }

            } else {
                this.enable = false;
                this.message = false;
            }
        });
    }

    getSenator() {
        this.storage.get('senators').then((val) => {
            if (val != null) {
                this.senators = val;
                console.log(val, 'senators');
            }
        });
    }

    getAddress() {
        this.storage.get('repAdress').then((val) => {
            if (val != null) {
                this.repAddress = val;
            } else {
                this.repAddress = "No Address";
            }
        });
    }


    finReps() {
        let modal = this.modalCtrl.create(AdressModalPage);
        modal.onDidDismiss(() => {
            this.getReps();
            this.getAddress();
        });
        modal.present();

    }


    getRepID(rep, fax, twitter, email, bioguide, offices?) {
        this.httpProvider.getJsonData(this.repsEndpoint + bioguide).subscribe(result => {
            console.log("Rally Search", result);
            this.data.representative_id = result[0].id;
            this.presentActionSheet(rep, result[0].fax_url, result[0].twitter_id, email, result[0].id, result[0].offices);
        });
    }

    goToOrganizationProfile(organizationID) {
        this.navCtrl.push(OrganizationProfilePage, {
            organizationID: organizationID,
            OrgPageName: "Discover"
        }, {animate: true, animation: 'transition', duration: 500, direction: 'forward'});
    }

    getID(bioguide) {
        this.httpProvider.getJsonData(this.repsEndpoint + bioguide).subscribe(result => {
            console.log(result);
            this.goToRepProfile(result[0].id,);
        });
    }

    goToRepProfile(repID) {
        this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {
            animate: true,
            animation: 'transition',
            duration: 500,
            direction: 'forward'
        });
    }

    getIcon(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myrallyID;

            });

            if (!found) {
                return 'md-heart-outline';

            } else {
                return 'md-heart';

            }
        }

    }

    ellipsisController() {
        this.disable = true;

        let name = this.orgName,
            orgID = this.organizationID,
            followers = this.objective.organization['followers'],
            notify = this.objective.organization['notify'],
            title = this.objTitle,
            imgURI = this.orgPhoto;

        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this post via...',
                    handler: () => {
                        this.shareProvider.otherShare(title, 'MESSAGE---', imgURI, constants.appStoreUrl)
                            .then(() => {
                                this.disable = false;
                            }, err => {
                                console.log(err);
                                this.disable = false;
                            })

                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiers(orgID);

                    }
                },
                {
                    text: this.getOrganizationFollowStatus(followers) + ' ' + name,
                    handler: () => {
                        this.orgStatus(orgID);
                        console.log("test");

                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");

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
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myrallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiers(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }

    getOrganizationFollowStatus(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el.id == this.myrallyID;

            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';

            }
        }
    }

    orgStatus(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID).subscribe(
            result => {
                if (result != "") {
                    this.unfollowOrg(result[0].id, orgID);
                    console.log("Unfollow");
                } else {
                    console.log("Follow");
                    this.followOrg(orgID);
                }
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            });
    }

    unfollowOrg(recordID, orgID) {

        this.httpProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(orgID, 'organizations');
    }

    followOrg(organizationID) {
        this.httpProvider.followOrganization(this.organizationEndpoint, this.myrallyID, organizationID);
    }
}
