import { Component, NgZone } from '@angular/core';
import {ModalController, NavController} from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { AlertController } from 'ionic-angular'; 
import { AngularFireAuth } from 'angularfire2/auth';
import { FeedPage } from '../feed/feed';
import { EditProfilePage } from '../edit-profile/edit-profile';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { PublicFeedPage } from '../public-feed/public-feed';
import { Facebook } from '@ionic-native/facebook';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { UsersProvider } from '../../providers/users/users';
import { TabsPage } from '../tabs/tabs';
import { WelcomePage } from '../welcome/welcome';
import { HelloPage } from '../hello/hello';
import { TermsPage } from '../terms/terms';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import {InterestedOrganizationsPage} from "../interested-organizations/interested-organizations";
import {GeneralModalComponent} from "../../components/general-modal/general-modal";



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  @ViewChild(Slides) slides: Slides;
  facebookLoggedIn = false; 
  provider =  {
    loggedin: false,
    name: '',
    profilePicture : '',
    email: false
  };
   HAS_LOGGED_IN = 'hasLoggedIn';
   users: FirebaseListObservable<any>;
   user:any = {
     uid: '',
     displayName: '',
     photoURL: '',
     provider: '',
     email: '',
     searchable: '1',
     hide_activity: '0',
    facebook_id: '',
    username: '',

   };
   endpoint:string = 'users/';



  constructor(
    private fire: AngularFireAuth,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public storage: Storage,
    private facebook: Facebook,
    private db: AngularFireDatabase,
    private httpProvider:UsersProvider,
    private modalCtrl: ModalController,
    private readonly ngZone: NgZone

  ) {
      this.users = db.list('/users');
console.log('USERS FROM FIRE');
console.log(this.users);
  }

 
    
  checkIfUserExists(id){
    let userRef = this.db.database.ref('users/'+id);

    userRef.once('value').then((snapshot) => {
      if (snapshot.hasChildren()) {
        console.log('Usuario ya existe');
        this.navCtrl.setRoot(TabsPage);
       } else{
         console.log('Nuevo Usuario', this.user);
           this.db.database.ref('users/'+this.user.uid).set(this.user);
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

  startFacebookLogin() {
      let data = {
          title: "Accept & Continue!",
          subTitle: "By signing up, you agree to our \n" +
          "Terms of Use & Privacy Policy",
          buttonName: 'Accept',
          rows: [
              {text: "Terms & Conditions", id: 1},
              {text: "Privacy Policy", id: 2},
              {text: "Decline", id: 3},
          ]
      };
      let modal = this.modalCtrl.create('GeneralModalComponent', data);
      modal.onDidDismiss(data => {
          if(data.accepted) {
              this.facebookLogin();
          }
          if(data.actionId === 1) {
              this.navCtrl.push(TermsPage);
          }
          if(data.actionId === 2) {
              this.navCtrl.push(PrivacyPolicyPage);
          }
      });
      modal.present();
  }

  facebookLogin(): void{
    console.log("Hola Facebook API");
// this.navCtrl.push(InterestedOrganizationsPage);

    this.facebook.login(["email", "public_profile", "user_friends"]).then((loginResponse) => {
        let credential = firebase.auth.FacebookAuthProvider.credential(loginResponse.authResponse.accessToken);
        firebase.auth().signInWithCredential(credential).then((res) =>{
          console.log(res);
          this.storage.set('UID', res.uid);
          this.user.uid = res.uid;
          this.storage.set('DISPLAYNAME', res.displayName);
          this.user.displayName = res.displayName;
          let username = res.displayName.split(" ");
          var nickname;
          if(username[2] != null){
            nickname = (username[0]+username[2]).toLowerCase();
          }else{
            nickname = (username[0]+username[1]).toLowerCase();

          }
          console.log("username", nickname);
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
          console.log(res);
          this.checkIfUserExists(res.uid);
        })
    }, error => {
      console.log("Error connecting to Facebook", error);
    });

}



// twLogin(): void {
//   this.twitter.login().then( response => {
//     const twitterCredential = firebase.auth.TwitterAuthProvider
//         .credential(response.token, response.secret);

//     firebase.auth().signInWithCredential(twitterCredential)
//     .then( res => {
//           console.log(JSON.stringify(res));
//           this.storage.set('UID', res.uid);
//           this.user.uid = res.uid;
//           this.storage.set('DISPLAYNAME', res.displayName);
//           this.user.displayName = res.displayName;
//           this.storage.set('USERNAME', res.username);
//           this.storage.set('PHOTOURL', res.photoURL);
//           this.user.photoURL = res.photoURL;
//           this.storage.set('PROVIDER', 'twitter.com');
//           this.user.provider = 'twitter.com';
//           this.storage.set('EMAIL', res.email);
//           this.user.email = res.email;
//           this.storage.set('LOCATION', res.location);
//           this.storage.set('DESCRIPTION', res.description);
//           this.storage.set(this.HAS_LOGGED_IN, true);
//           this.checkIfUserExists(res.uid);
          
//     });
//   }, error => {
//     console.log("Error connecting to twitter: ", error);
//   });
// }

 
   
  Logout(){
    this.fire.auth.signOut();
  }

 
  goToFeed() {    
       this.navCtrl.setRoot(HelloPage);
     }

  goToTerms(){
    this.navCtrl.push(TermsPage);
  }

  goToPrivacy(){
    this.navCtrl.push(PrivacyPolicyPage);
  }
}