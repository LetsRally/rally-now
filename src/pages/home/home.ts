import {Component, NgZone} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {Slides} from 'ionic-angular';
import {AlertController} from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import {FeedPage} from '../feed/feed';
import {EditProfilePage} from '../edit-profile/edit-profile';
import firebase from 'firebase';
import {Storage} from '@ionic/storage';
import {PublicFeedPage} from '../public-feed/public-feed';
import {Facebook} from '@ionic-native/facebook';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {UsersProvider} from '../../providers/users/users';
import {TabsPage} from '../tabs/tabs';
import {WelcomePage} from '../welcome/welcome';
import {HelloPage} from '../hello/hello';
import {TermsPage} from '../terms/terms';
import {PrivacyPolicyPage} from '../privacy-policy/privacy-policy';
import {GooglePlus} from "@ionic-native/google-plus";


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    @ViewChild(Slides) slides: Slides;
    facebookLoggedIn = false;
    provider = {
        loggedin: false,
        name: '',
        profilePicture: '',
        email: false
    };
    HAS_LOGGED_IN = 'hasLoggedIn';
    users: FirebaseListObservable<any>;
    user: any = {
        uid: '',
        displayName: '',
        photoURL: '',
        provider: '',
        email: '',
        searchable: '1',
        hide_activity: '0',
        facebook_id: '',
        username: '',
        phone: ''

    };
    endpoint: string = 'users/';


    constructor(
        private fire: AngularFireAuth,
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public storage: Storage,
        private facebook: Facebook,
        private googlePlus: GooglePlus,
        private db: AngularFireDatabase,
        private httpProvider: UsersProvider,
        private readonly ngZone: NgZone
    ) {
        this.users = db.list('/users');

    }


    checkIfUserExists(id) {
        let userRef = this.db.database.ref('users/' + id);

        userRef.once('value').then((snapshot) => {
            this.storage.set('USER_PHONE', snapshot.val().phone);
            if (snapshot.hasChildren()) {
                console.log('Usuario ya existe');
                this.navCtrl.setRoot(TabsPage);
            } else {
                console.log('Nuevo Usuario', this.user);
                this.db.database.ref('users/' + this.user.uid).set(this.user);
                this.httpProvider.saveNewUser(this.endpoint, this.user).subscribe(data => {
                    console.log("Nuevo Usuario", data);
                    this.storage.set('APIRALLYID', data.id);
                    this.httpProvider.saveApiRallyID(data.id);
                    this.ngZone.run(() => this.navCtrl.setRoot(HelloPage));
                }, error => {
                    console.log("Error", error);
                });
            }
        });

    }

    googleLogin() {
        this.googlePlus.login({})
            .then(res => {
                console.log('GOOGLE LOGIN');
                console.log(res);
                this.storage.set('loginFrom', 'google');
                this.firebaseGoogleLogin(res);
            })
            .catch(err => console.error(err));
    }


    facebookLogin(): void {
        console.log("Hola Facebook API");

        this.facebook.login(["email", "public_profile", "user_friends"]).then((loginResponse) => {
            this.firebaseFacebookLogin(loginResponse);
            this.storage.set('loginFrom', 'facebook');
        }, error => {
            console.log("Error connecting to Facebook", error);
        });

    }

    firebaseFacebookLogin(response) {
        let credential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
        firebase.auth().signInWithCredential(credential).then((res) => {
            this.storage.set('UID', res.uid);
            this.user.uid = res.uid;
            this.storage.set('DISPLAYNAME', res.displayName);
            this.user.displayName = res.displayName;
            let username = res.displayName.split(" ");
            var nickname;
            if (username[2] != null) {
                nickname = (username[0] + username[2]).toLowerCase();
            } else {
                nickname = (username[0] + username[1]).toLowerCase();

            }

            this.storage.set('USERNAME', nickname);
            this.user.username = nickname;
            this.storage.set('PHOTOURL', res.photoURL);
            this.user.photoURL = res.photoURL;
            this.storage.set('PROVIDER', 'twitter.com');
            this.user.provider = 'facebook.com';
            this.storage.set('EMAIL', res.email);
            this.user.email = res.email;
            this.storage.set('LOCATION', res.location);
            this.storage.set('DESCRIPTION', res.description);
            this.user.facebook_id = res.providerData[0].uid;
            this.storage.set(this.HAS_LOGGED_IN, true);
            this.checkIfUserExists(res.uid);
        })
    }

    firebaseGoogleLogin(response) {
        console.log(response);
        let credential = firebase.auth.GoogleAuthProvider.credential(response.idToken);
        console.log('000000000');
        console.log(credential);
        firebase.auth().signInWithCredential(credential)
            .then((res) => {
                console.log('RES=======');
                console.log(res);
                // this.storage.set('UID', res.uid);
                // this.user.uid = res.uid;
                this.storage.set('DISPLAYNAME', res.displayName);
                this.user.displayName = res.displayName;
                let username = [res.familyName, res.givenName];
                var nickname;
                if (username[2] != null) {
                    nickname = (username[0] + username[2]).toLowerCase();
                } else {
                    nickname = (username[0] + username[1]).toLowerCase();

                }

                this.storage.set('USERNAME', nickname);
                this.user.username = nickname;
                this.storage.set('PHOTOURL', res.imageURL);
                this.user.photoURL = res.imageURL;
                this.storage.set('PROVIDER', 'google.com');
                this.user.provider = 'google.com';
                this.storage.set('EMAIL', res.email);
                this.user.email = res.email;
                // this.storage.set('LOCATION', res.location);
                // this.storage.set('DESCRIPTION', res.description);
                // this.user.facebook_id = res.providerData[0].uid;
                this.storage.set(this.HAS_LOGGED_IN, true);
                this.checkIfUserExists(res.userId);
            }, err => {
                console.log('ERROR');
                console.log(err);
            })
            .catch((err) => {
                console.log('CATCH ERROR');
                console.log(err);
            })
    }


    goToFeed() {
        this.navCtrl.setRoot(HelloPage);
    }

    goToTerms() {
        this.navCtrl.push(TermsPage);
    }

    goToPrivacy() {
        this.navCtrl.push(PrivacyPolicyPage);
    }
}