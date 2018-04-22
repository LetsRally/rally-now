import { Component } from '@angular/core';
import { NavController, ModalController, ToastController, ActionSheetController } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { FriendsRequestPage } from '../friends-request/friends-request';
import { MyRepsPage } from '../my-reps/my-reps';
import { StreaksHistoryPage } from '../streaks-history/streaks-history';
import { FollowedOrganizationsPage } from '../followed-organizations/followed-organizations';
import { FollowedCandidatesPage } from '../followed-candidates/followed-candidates';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { FeedPage } from '../feed/feed';
import { AlertsPage } from '../alerts/alerts';
import { PopoverController } from 'ionic-angular';
import { OverlayPage } from '../overlay/overlay'
import { UserData } from '../../providers/user-data'; 
import { AngularFireDatabase } from 'angularfire2/database/database';
import { UsersProvider } from '../../providers/users/users';
import { MyFriendsPage } from '../my-friends/my-friends';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { RepresentivesListPage } from '../representives-list/representives-list';
import { AdressModalPage } from '../adress-modal/adress-modal';
import { MyRepresentativesPage } from '../my-representatives/my-representatives';
import { Storage } from '@ionic/storage';
import { SocialShareProvider } from '../../providers/social-share/social-share';
import { SignFeedBackPage } from '../sign-feed-back/sign-feed-back';
import { OrganizationActionPage } from '../organization-action/organization-action';
import { OrganizationProfilePage } from '../organization-profile/organization-profile';
import { RepresentativeProfilePage } from '../representative-profile/representative-profile';
import { Facebook } from '@ionic-native/facebook';




@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

  profileURL:any;
  endpoint:any ='users';
  name:string;
  location:string;
  description:string;
  currentRallyID:any;
  streaksEndpoint:any = 'actions?user_id=';
  streaks:any;
  actions_taken:any;
  shares:any;
  starCount:number = 0;
  replacedDate:any = ''; 
  public starArray:any[] = [];
  public buttonClicked: boolean = false; //Whatever you want to initialise it as
  firsToggleIcon:any = "ios-arrow-down";
  secondToggleBtn: boolean = true; 
  actions:any;
  longest_streak:any;
  streakToShow:any;
   user={
    displayName: '',
    photoURL: '',
    location: '',
    description: '',
    actions_taken:'',
    shares: '',
    friends_count: '',
    followers_count: '',
    organizations_count: '',
    my_activity: '',
    username: '',
    id: ''
  };
  disable:boolean = false;
  likeendpoint:any = 'likes';
  activityLike:any = 'd32c1cb5-b076-4353-ad9c-1c8f81d812e3';
  objectiveActions:any;
  favEndpoint:any = 'actions';
  shareAction:any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
  activitiesData:any;
  public records:any = [];


  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public userData: UserData,
    public af:AngularFireDatabase,
    private httpProvider:UsersProvider,
    private photoViewer: PhotoViewer,
    public modalCtrl: ModalController,
    private storage: Storage,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    private shareProvider:SocialShareProvider,
    private facebook: Facebook
    ) {}


    ionViewWillEnter(){
      this.records = [];
    this.httpProvider.returnRallyUserId().then(user =>{
      this.currentRallyID = user.apiRallyID;
      this.getUserData();
      this.getStreaks();
      this.getLongest();
  });
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  public onButtonClick() {
    
            this.buttonClicked = !this.buttonClicked;
            this.firsToggleIcon = 'ios-arrow-up';
        }

        onToggleSecond(){
          this.secondToggleBtn = !this.secondToggleBtn;
        }

 // ngAfterViewInit(){
 //  }
//  ionViewDidLoad(){
//     this.getUID();
//  }

  // getUID(){
  //      this.userData.getUid().then((uid) => {
  //        console.log(uid);
  //         this.af.database.ref('users/'+uid)
  //          .on('value', snapshot => {
  //            console.log(snapshot.val().displayName);
  //            this.user.displayName = snapshot.val().displayName;
  //            this.user.photoURL = snapshot.val().photoURL;
  //            this.user.location = snapshot.val().location || '';
  //            this.user.description = snapshot.val().description || '';
  //          });
  //      });
  //    }


     getUserData(){
       this.httpProvider.getJsonData(this.endpoint+'?id='+this.currentRallyID)
        .subscribe(
          result => {
            this.user.displayName = result[0].name;
            this.user.photoURL = result[0].photo_url;
            this.user.location = result[0].country;
            this.user.description = result[0].description;
            this.user.actions_taken = result[0].actions_taken;
            this.user.shares = result[0].shares;
            this.user.friends_count = result[0].friends_count;
            this.user.followers_count = result[0].followers_count;
            this.user.organizations_count = result[0].following_count;
            this.user.my_activity = result[0].my_actions;
            this.actions = result[0].actions;
            this.longest_streak = result[0].longest_streak;
            this.user.username = result[0].username;
            this.user.id = result[0].id;
            this.getArray(result[0].Objectives_Actions);
            this.getArray(result[0].Direct_Actions);
            this.getArray(result[0].Contact_Actions);
          }
        );
     }

     sortArray(array){
      array.sort(function(a, b){
        var dateA:any = new Date(a.created_at), dateB:any = new Date(b.created_at);
        return dateB - dateA;
      });
    }
    
    getArray(array){
      for(let person of array) {
        this.records.push(person);
        this.sortArray(this.records);
      } 
    
    }


 

 	 goToSettings(){
  	this.navCtrl.push(SettingsPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToRequests(){
  	this.navCtrl.push(FriendsRequestPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToReps(){
  	this.navCtrl.push(RepresentivesListPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  } 

  goToStreaks(){
    this.navCtrl.push(StreaksHistoryPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToFollowedOrganizations(){
    this.navCtrl.push(FollowedOrganizationsPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToFollowedCandidates(){
    this.navCtrl.push(FollowedCandidatesPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }
  
  goToEditProfile(){
    this.navCtrl.push(EditProfilePage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToHome(){
    this.navCtrl.setRoot(FeedPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  goToAlerts(){
    this.navCtrl.setRoot(AlertsPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

  presentPopover() {
       let popover = this.popoverCtrl.create(OverlayPage);
       popover.present();
     }

     goToMyFriends(){
       this.navCtrl.push(MyFriendsPage, {animate:true,animation:'transition',duration:500,direction:'forward'});
     }

     showPhotoViewer(){
       this.facebook.api('me?fields=picture.width(900)', ['public_profile']).then(data => {
         console.log(data);
        this.photoViewer.show(data.picture.data.url);

       });
}


getStreaks(){
  this.httpProvider.getJsonData(this.streaksEndpoint + this.currentRallyID)
   .subscribe( result =>{
     console.log("Racha", result.length, result);
     this.streaks = result.reverse();
    //  this.streaks = [
    //   {created_at: '2017-11-19TSomething'},
    //   {created_at: '2017-11-18TSomething'},
    //    {created_at: '2017-11-06TSomething'},
    //    {created_at: '2017-11-06TSomething'},
    //    {created_at: '2017-11-05TSomething'},
    //    {created_at: '2017-11-04TSomething'},
    //    {created_at: '2017-11-02TSomething'},
    //    {created_at: '2017-11-01TSomething'}
    //  ];
     console.log("From variable", this.streaks.length);
     for(let i=0; i < this.streaks.length; i++ ){
         let cuttedStreak = this.streaks[i].created_at.split('T');
         let date = cuttedStreak[0];             
         date = date.split('-');
         let newDate = date[1]+"/"+date[2]+"/"+date[0];
         let timestampDate = new Date(newDate).getTime();
         
         console.log(this.replacedDate);
          if(this.replacedDate != ""){
             if(timestampDate < this.replacedDate){
               let difference = this.replacedDate - timestampDate;
               let ms = difference / 1000;
               let seconds = ms % 60;
               ms /= 60;
               let minutes = ms % 60;
               ms /= 60;
               let hours = ms % 24;
               ms /= 24;
               let days = ms;
               this.replacedDate = timestampDate;

               if (days <= 1){
                   if(days != 0){
                     this.starCount++;
                     this.starArray.push({days: days});
                   }  
               }
               
             }

         }else{
           this.replacedDate = timestampDate;
         }
       
     }
    
     
     
   });
}

  finReps(){
    let modal = this.modalCtrl.create(AdressModalPage);
    modal.onDidDismiss(() => {
      this.goToMyReps();
    });
    modal.present();
  }

  getReps(){
    this.storage.get('representatives').then((val) => {
      console.log(val);
        if (val != null){
          this.goToMyReps();
        } else{
          this.finReps();
        }
    });
  }

  goToMyReps(){
    this.navCtrl.push(MyRepresentativesPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});

  }

  getLongest(){
    if(this.starArray.length > this.longest_streak){
      console.log(this.longest_streak);

      this.updateStreak(this.starArray.length);
      this.streakToShow = this.starArray.length;
    }else{
      this.streakToShow = this.longest_streak;

    }
  }

  updateStreak(value){
    this.httpProvider.updateSingleItem(this.endpoint + '/' + this.currentRallyID, JSON.stringify({longest_streak: value}));
  }

  getLikeStatus($event, reference_id, like_type, likes){
    this.disable = true;

    this.httpProvider.getJsonData(this.likeendpoint+'?reference_id='+reference_id+'&user_id='+this.user.id).subscribe(
      result => {
        console.log($event);
        console.log("Aqui", $event.srcElement.lastChild.data);
        
        if(result != "" ){
          this.removeFav(result[0].id);
          this.presentToast('You unliked it');
          $event.srcElement.style.backgroundColor = '#f2f2f2';
          $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
          $event.srcElement.lastChild.data--;
          $event.srcElement.children[0].className = 'icon icon-md ion-md-heart-outline';
          $event.srcElement.style.color = '#b6b6b6';
          
        }else{
         this.addLike(reference_id, like_type);
         this.presentToast('You liked it');
          $event.srcElement.style.backgroundColor = '#296fb7';
          $event.srcElement.offsetParent.style.backgroundColor = '#296fb7';
          $event.srcElement.lastChild.data++;
          $event.srcElement.children[0].className = 'icon icon-md ion-md-heart';
          $event.srcElement.style.color = '#f2f2f2';
        }
      },
      err =>{
        console.error("Error : "+err);         
      } ,
      () => {
        console.log('getData completed');
      }

      );
  }

  addLike(reference_id, like_type){
    this.httpProvider.addLike(this.likeendpoint, reference_id, this.user.id, like_type).subscribe(
      response =>{
          console.log(response);
          this.disable = false;
      });

  }


  findInLoop(actions){
    if (actions != null){
      var found = actions.some(el => { 
          return el == this.user.id;
        
      });
      
      if (!found){
        return '#f2f2f2';
        
      }else{
        return '#296fb7';
        
      }
    }

  }

  getIcon(actions){
    if (actions != null){
      var found = actions.some(el => { 
          return el == this.user.id;
        
      });
      
      if (!found){
        return 'md-heart-outline';
        
      }else{
        return 'md-heart';
        
      }
    }

  }


  getColor(actions){
    if (actions != null){
      var found = actions.some(el => { 
          return el == this.user.id;
        
      });
      
      if (!found){
        return '#b6b6b6';
        
      }else{
        return '#f2f2f2';
        
      }
    }

  }





removeFav(recordID){
  this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
    console.log(res);
    this.disable = false;

  }, err =>{
    console.log(err);
  });
  this.httpProvider.removeFollowRecordID(recordID, 'favorites');

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
       this.presentToast('Objective shared!');
       this.disable = false;

     }
   }, 
   {
     text: 'Twitter',
     handler: () => {
       this.shareProvider.twitterShare(title, imgURI).then(() =>{
        this.addShareAction(reference_id, like_type);
        $event.path[1].lastChild.data++;
        this.presentToast('Objective shared!');
        this.disable = false;
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
  //     this.presentToast('Objective shared!');
  //     this.disable = false;

  //   }
  // },
  // {
  //   text: 'Email',
  //   handler: () => {
      
  //     this.presentToast('Objective shared!');
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


addShareAction(goal_id, action_type_id){
  this.httpProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.user.id);
}

goToRepProfile(repID){
  this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {animate:true,animation:'transition',duration:500,direction:'forward'});
}

goToOrganizationProfile(organizationID){
  this.navCtrl.push(OrganizationProfilePage, {
     organizationID: organizationID,
     OrgPageName: "My Profile"
}, {animate:true,animation:'transition',duration:500,direction:'forward'});
}

goToActionPage(objectiveID, goal_type, source, goalID, repID){ 
  if(goal_type !== "sign"){
   this.navCtrl.push(OrganizationActionPage, {
     objectiveID: objectiveID,
     pageName: 'My Profile'
 }, {animate:true,animation:'transition',duration:500,direction:'forward'});
  } else{
   this.navCtrl.push(SignFeedBackPage, {iframeUrl: source, repID:repID, goalID: goalID}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }  
 
}

transform(value: any) {
  if (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
return value;
}

giveFeedBack(){
  this.shareProvider.feedback();
}

        
}