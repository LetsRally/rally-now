import { Component, ViewChild } from '@angular/core';
import {  NavController, AlertController, PopoverController, LoadingController, ActionSheetController, ToastController, Events, ModalController } from 'ionic-angular';
import { AlertsPage } from '../alerts/alerts'
import { ProfilePage } from '../profile/profile'
import { HomeFiltersPage } from '../home-filters/home-filters';
import { OverlayPage } from '../overlay/overlay'
import { RatePage } from '../rate/rate';
import { OrganizationsProvider } from '../../providers/organizations/organizations';
import { OrganizationProfilePage } from '../organization-profile/organization-profile';
import { PublicProfilePage } from '../public-profile/public-profile';
import { SocialShareProvider } from '../../providers/social-share/social-share';
import { OrganizationActionPage } from '../organization-action/organization-action';
import { UsersProvider } from '../../providers/users/users';
import {AngularFireDatabase} from 'angularfire2/database';
import firebase from 'firebase';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { UserData } from '../../providers/user-data';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import {EventDetailPage} from '../event-detail/event-detail';
import { FriendsRequestPage } from '../friends-request/friends-request';
import { FilterEventsPage } from '../filter-events/filter-events';
import { WebviewPage } from '../webview/webview';
import { Content } from 'ionic-angular';
import { SignFeedBackPage } from '../sign-feed-back/sign-feed-back';
import { ThankYouPage } from '../thank-you/thank-you';
import { DomSanitizer } from '@angular/platform-browser';
import { RepresentativeProfilePage } from '../representative-profile/representative-profile';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ThanksPage } from '../thanks/thanks';
import { DonateFeedBackPage } from '../donate-feed-back/donate-feed-back';
import { NotificationProvider } from '../../providers/notification/notification';

@Component({
  selector: 'page-feed', 
  templateUrl: 'feed.html'
})

export class FeedPage {
  organizationsData:any;
  endpoint:string = 'homefeed/';
  loading:any;
  public objectives:any = [];
  public fiends:any = [];
  favEndpoint:any = 'actions';
  myrallyID:any;
  hide_enpoint:any = 'hide_objective'; 
  buttonColor:string = 'red';
  userEndpoint:any = 'users/';
  enabled:boolean = false;
  likeAction:any ='1e006561-8691-4052-bef8-35cc2dcbd54e';
  likesCount: number; 
  public events:any = [];
  shareAction:any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
  testPhoto:any = 'https://c1.staticflickr.com/9/8409/buddyicons/41284017@N08_l.jpg?1369764880#41284017@N08';
  localPhoto:any = 'https://static1.squarespace.com/static/5669e1f969a91ad6eca4abe1/t/581cc790b3db2bd6d9881936/1478281126634/Screen+Shot+2016-11-04+at+1.33.31+PM.png';
  avatarPhoto:any = 'https://flipagram.com/assets/resources/img/fg-avatar-anonymous-user-retina.png';
  goalLike:any = 'ea9bd95e-128c-4a38-8edd-938330ad8b2d';
  activityLike:any = 'd32c1cb5-b076-4353-ad9c-1c8f81d812e3';
  eventLike:any = 'd5d1b115-dbb6-4894-8935-322c336ae951';
  tweetLike:any = 'ab860ccb-9713-49e5-b844-34d18f92af21';
  likeendpoint:any = 'likes';
  disable:boolean = false;
  organizationEndpoint:any = 'following_organizations';
  tweet:any;
  enableRepCard:boolean = false;
  eventStart:any;
  eventEnd:any;
  eventFiltered:boolean = false;
  newEndpoint:any = 'homefeed_pagination/';
  private start:number=1;
  public orgTweets:any = [];
  public repsTweets:any = [];
  public records:any = [];
  zipcode:any;
  distance:any; 
  filterBy:any; 
  safeSvg:any; 
  followEndpoint:any = 'following_representative';
  enablePlaceholder:boolean = true;
  loader:boolean = false; 


  // @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController, 
    public popoverCtrl: PopoverController,
    private httpProvider:OrganizationsProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    private shareProvider:SocialShareProvider,
    private usersProv: UsersProvider,
    public toastCtrl: ToastController, 
    private db: AngularFireDatabase,
    private network: Network,
    private storage: Storage,
    private storageProvider: UserData,
    private photoViewer: PhotoViewer,
    public eventsAng: Events,
    public modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private inAppBrowser: InAppBrowser,
    noti: NotificationProvider) { 


      firebase.auth().onAuthStateChanged(user => {
        if (user) {
           this.storage.get('introShown').then((result) => {
           if (result) {
             console.log('Not First Time');

           }else{
             this.usersProv.returnRallyUserId()
               .then(user => {
                 console.log("Usuario desde Notificaciones", user.apiRallyID);
                 noti.init(user.apiRallyID);

               });
             console.log('First Time');
            
             this.storage.set('introShown', true);

           }
        });
          
        }else{
          console.log("No estas logueado para notificaciones");
        }
        
      });

      console.log("Network", this.network.type);
      this.enablePlaceholder = true;
       
        this.usersProv.returnRallyUserId()
      .then(user => {
        console.log(" Usuario",user); 
        this.myrallyID = user.apiRallyID;
            this.getdata();
            this.saveLog();
         
      });
   
    
        


  }

  ionViewWillEnter(){
    // this.records = [];
    
  }


 
  saveLog(){
    this.usersProv.addItem('log', JSON.stringify({
      user_id: this.myrallyID,
      screen: 'Homefeed',
      message: 'Visited'
    })).subscribe(data =>{
      console.log("Log", data);
    });
  }
 

  
  
 	 goToOtherPage() {
    this.navCtrl.setRoot(AlertsPage,{}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

   goToProfile() {
   this.navCtrl.setRoot(ProfilePage, {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
  }

   goToHomeFilter() {
    this.navCtrl.setRoot(HomeFiltersPage);
  }

   presentPopover() {
    let popover = this.popoverCtrl.create(OverlayPage);
    popover.present();
  }
   
  goToRatePage() {
    this.navCtrl.push(RatePage,  {}, {animate: true, direction: 'forward'});
  }

  getdata(startDate?, endDate?, zipcode?, distance?, filterBy?){
    
    if(startDate != null){
      console.log(filterBy);
      if(filterBy !== 'all'){
        var url = this.endpoint + this.myrallyID + '/' + startDate + '/' + endDate + '/' + zipcode + '/' + distance + '/';
      }else{
        var url = this.endpoint + 'all-events/' + this.myrallyID + '/' + startDate + '/' + endDate + '/' + zipcode + '/' + distance + '/';

      }
      this.eventFiltered = true;
    } else{
      var url = this.newEndpoint + this.myrallyID + '/';
    }
 
    console.log("This url =>", url);
  

  return new Promise(resolve => {
    this.httpProvider.loadHome(url, this.start)
      .then(data => {
        console.log("Full Data", data);
        this.getArray(data);
        

        //this.organizations = data;
          
        resolve(true);
        //this.loading.dismiss(); 
        this.enablePlaceholder = false;
        this.loader = false;

      });
  });
} 

getArray(array){
  // console.log(array);
  for(let person of array) {
    // console.log(person);
    this.records.push(person);
    console.log("Records", this.records);
  }

}

doInfinite(infiniteScroll:any) {
  console.log(infiniteScroll);
  console.log('doInfinite, start is currently '+this.start);
  this.start+=1;
  console.log(this.start);
  
  this.getdata(this.eventStart, this.eventEnd, this.zipcode, this.distance, this.filterBy).then(()=>{
    infiniteScroll.complete();
  });
  
}

doRefresh(refresher) {
  this.start = 1;
  this.records = [];
  // this.loading = this.loadingCtrl.create({
  //   spinner: 'hide',
  //   content: this.safeSvg,
  //   }); 
  //   this.loading.present();
  //this.getdata();
  this.getdata(this.eventStart, this.eventEnd, this.zipcode, this.distance, this.filterBy);

  //this.eventFiltered = false;
  //this.enablePlaceholder = true;
  this.loader = true;

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  } 


   goToOrganizationProfile(organizationID){
       this.navCtrl.push(OrganizationProfilePage, {
          organizationID: organizationID,
          OrgPageName: "Home"
    }, {animate:true,animation:'transition',duration:500,direction:'forward'});
     }


     goToRepProfile(repID){
      this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {animate:true,animation:'transition',duration:500,direction:'forward'});
    }

     goToPublicProfile(userID){
       this.navCtrl.push(PublicProfilePage, {
          param1: userID,
          profilePageName: "Home"
    }, {animate:true,animation:'transition',duration:500,direction:'forward'});
     }
 
     goToActionPage(objectiveID, goal_type, source, goalID, repID){ 
       if(goal_type === "contact"){
        this.navCtrl.push(OrganizationActionPage, {
          objectiveID: objectiveID,
          pageName: 'Home'
      }, {animate:true,animation:'transition',duration:500,direction:'forward'});
       } else if(goal_type === 'sign'){ 
        this.navCtrl.push(SignFeedBackPage, {iframeUrl: source, repID:repID, goalID: goalID}, {animate:true,animation:'transition',duration:500,direction:'forward'});
       }  else if(goal_type === 'donate'){
        this.navCtrl.push(DonateFeedBackPage, {iframeUrl: source, repID:repID, goalID: goalID}, {animate:true,animation:'transition',duration:500,direction:'forward'});

       }
      
     }

     share(title, imgURI){
       this.shareProvider.otherShare(title, imgURI);
     }


 shareController(title, imgURI, reference_id, like_type, $event) {
   console.log($event);
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
           this.streakModal();
 
         }
       }, 
       {
         text: 'Twitter',
         handler: () => {
           this.shareProvider.twitterShare(title, imgURI).then(() => {
            console.log("twitter: Success");
            this.addShareAction(reference_id, like_type);
           $event.path[1].lastChild.data++;
           this.presentToast('Objective shared!');
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

 streakModal() {
  let modal = this.modalCtrl.create(ThanksPage);
  modal.present();
}

  presentToast(message) {
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000
      });
      toast.present();
    }


    getLikeStatus($event, reference_id, like_type, likes){
      this.disable = true;

      this.usersProv.getJsonData(this.likeendpoint+'?reference_id='+reference_id+'&user_id='+this.myrallyID).subscribe(
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
      this.usersProv.addLike(this.likeendpoint, reference_id, this.myrallyID, like_type).subscribe(
        response =>{
            console.log(response);
            this.disable = false;
        });

    }



    hideItem(objective_id, index){
        this.usersProv.hideObjective(this.hide_enpoint, this.myrallyID, objective_id);
        (this.objectives).splice(index, 1);
    }
    



  findInLoop(actions){
    if (actions != null){
      var found = actions.some(el => { 
          return el == this.myrallyID;
        
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
          return el == this.myrallyID;
        
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
          return el == this.myrallyID;
        
      });
      
      if (!found){
        return '#b6b6b6';
        
      }else{
        return '#f2f2f2';
        
      }
    }

  }




removeFav(recordID){
  this.usersProv.removeItem(this.likeendpoint, recordID).subscribe(res => {
    console.log(res);
    this.disable = false;

  }, err =>{
    console.log(err);
  });
  this.usersProv.removeFollowRecordID(recordID, 'favorites');

}

showPhotoViewer(path){
  this.photoViewer.show(path);
}

goToEventDetail(eventID){
  console.log(eventID);
  this.navCtrl.push(EventDetailPage, {
          eventID: eventID,
          eventPageName: "Home"
    }, {animate:true,animation:'transition',duration:500,direction:'forward'});
}

goToRequests(){
  this.navCtrl.push(FriendsRequestPage,  {}, {animate:true,animation:'transition',duration:500,direction:'forward'});
}



addShareAction(goal_id, action_type_id){
  this.usersProv.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myrallyID);
}


ellipsisController(name, id, index, orgID, desc, followers, notify){
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
      text: 'Hide post',
      handler: () => {
       this.hideItem(id, index);
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

eventEllipsisController(name, orgID, desc, followers, notify){ 
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Share this event via...',
      handler: () => {
        console.log("test");
        this.shareProvider.otherShare(name, desc);

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


tweetOrgEllipsisController(name, orgID, desc, followers, notify){
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
        this.checkNotifiers(orgID);

      }
    },
    {
      text: this.findInLoopTweet(followers) + ' ' + name,
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


tweetRepEllipsisController(name, repID, desc, followers, notify){
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
      text: this.findInLoopTweet(followers) + ' ' + name,
      handler: () => {
        this.followRep(repID);
        console.log("test");

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


followRep(repID){
  
  
  this.httpProvider.getJsonData(this.followEndpoint+'?user_id='+this.myrallyID+'&representative_id='+repID)
    .subscribe(
      result => {
        
        if (result != ""){              
          this.unFollowRep(result[0].id);
         
        } else{
          this.saveRepInApi(repID);

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

saveRepInApi(repID){
  this.usersProv.followRep(this.followEndpoint, this.myrallyID, repID);
  this.presentToast('Representative added');
  

}

unFollowRep(recordID){
  this.usersProv.unfollowOrganization(this.followEndpoint, recordID);
  this.presentToast('Representative removed');
}

findInLoopTweet(actions){
  if (actions != null){
    var found = actions.some(el => { 
        return el == this.myrallyID;
      
    });
    
    if (!found){
      return 'Follow';
      
    }else{
      return 'Unfollow';
      
    }
  }

}


orgStatus(orgID){
  this.usersProv.getJsonData(this.organizationEndpoint+'?follower_id='+this.myrallyID+'&organization_id='+orgID).subscribe(
        result => {
          if(result != ""){
             this.unfollowOrg(result[0].id, orgID);
             console.log("Unfollow");
          }else{
            console.log("Follow");
            this.followOrg(orgID);
          }
        },
        err =>{
        console.error("Error : "+err);
        } ,
        () => {
        console.log('getData completed');
        });
        }


        unfollowOrg(recordID, orgID){

          this.usersProv.unfollowOrganization(this.organizationEndpoint, recordID);
          this.usersProv.removeFollowRecordID(orgID, 'organizations');
          this.presentToast("You're not following this organization anymore");
        }

        followOrg(organizationID){
          this.usersProv.followOrganization(this.organizationEndpoint, this.myrallyID, organizationID );
          this.presentToast("You're now following this organization");

        }


        // updateOrg(){
        //   this.usersProv.updateSingleItem('organization/1ec4da14-2e80-44ca-8357-a242a27d6da9', JSON.stringify({image_url: 'https://bloximages.chicago2.vip.townnews.com/thenewsherald.com/content/tncms/assets/v3/editorial/6/fd/6fd68b02-0799-52ad-b15b-3cb6bdec637d/58e5411ecdcec.image.jpg'}));
        // }

        getDay(day){
          var d = new Date(day);
          var weekday = new Array(7);
          weekday[0] = "SUNDAY";
          weekday[1] = "MONDAY";
          weekday[2] = "TUESDAY";
          weekday[3] = "WEDNESDAY";
          weekday[4] = "THURSDAY";
          weekday[5] = "FRIDAY";
          weekday[6] = "SATURDAY";
          var n = weekday[d.getDay()];
          return n;
        }

        getShortDate(day){
          var d = new Date(day);
          var dd = d.getDate();
          
          var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
          // console.log(monthNames[d.getMonth()]);
          var date = monthNames[d.getMonth()] + ' ' + dd;
          return date;
        }

        goToEventFilter(){
          // this.navCtrl.push(FilterEventsPage,  {}, {animate:true,animation:'ios-transition',duration:500,direction:'forward'});
          let modal = this.modalCtrl.create(FilterEventsPage, {location: 'home'});
          modal.onDidDismiss((data) => {
            if(data === 'back'){
              console.log("No refresh");
            }else{
              this.getStartDate(); 

            }
            
          });
          modal.present();
          
        }

        getStartDate(){
          this.storage.get('startDate').then((val) => {
            this.eventStart = val;
            this.getEndDate();

          });
        }

        getEndDate(){
          this.storage.get('endDate').then((val) => {
            this.eventEnd = val; 
            this.getZipcode();
          });
        }

        getZipcode(){
          this.storage.get('homeZipcode').then((val) => {
            this.zipcode = val;
            this.getDistance();
          });
        }

        getDistance(){
          this.storage.get('homeDistance').then((val) => {
            this.distance = val;
            this.getFilterType();
          });

        }


        getFilterType(){
          this.storage.get('filterBy').then((val) => {
            this.filterBy = val;
            this.start = 1;
            this.getdata(this.eventStart, this.eventEnd, this.zipcode, this.distance, this.filterBy);
            this.records = [];
            // this.loading = this.loadingCtrl.create({
            //   spinner: 'hide',
            //  content: this.safeSvg,
            // }); 
            //   this.loading.present();
              this.enablePlaceholder = true;

          });

        }

      getOrganizationFollowStatus(actions){
        if (actions != null){
          var found = actions.some(el => { 
              return el.id == this.myrallyID;
            
          });
          
          if (!found){
            return 'Follow';
            
          }else{
            return 'Unfollow';
            
          }
        }
      }

      openWebpage(username, tweetID) {
        var url:string = 'https://twitter.com/' + username + '/status/' + tweetID;
        const options: InAppBrowserOptions = {
          zoom: 'no',
          toolbarposition: 'top',
          location: 'no'
        }
    
        // Opening a URL and returning an InAppBrowserObject
        const browser = this.inAppBrowser.create(url, '_blank', options);

        // Add styles for browser page
        browser.on("loadstop")
            .subscribe(
            () => {
                browser.insertCSS({
                    code: "header .rn-ipm5af{top: 16px !important; margin-top: 0 !important;} main{overflow:hidden}"
                })
            },
            err => {
                console.log("InAppBrowser Loadstop Event Error: " + err);
            });
    
       // Inject scripts, css and more with browser.X
      }

      transform(value: any) {
        if (value) {
          return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
      }

      notifyExist(actions){
        if (actions != null){
          var found = actions.some(el => { 
              return el == this.myrallyID;
            
          });
          
          if (!found){
            return 'Turn on notifications for ';
            
          }else{
            return 'Turn off notifications for ';
            
          }
        }
      }

      checkNotifiers(orgID){
        this.usersProv.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID)
          .subscribe(result => {
            console.log("Notifications", result);
            if(result != ""){
              console.log(result[0].enable_notifications);
              if(result[0].enable_notifications == true){
                this.usersProv.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                this.presentToast("You've turned off notifications for this organization");
              }else{
                this.usersProv.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                this.presentToast("You've turned on notifications for this organization");

              }
            }else{
              this.presentToast("You need to follow this organization to enable the notifications");
            }
          });
      }

      checkNotifiersRep(repID){
        this.usersProv.getJsonData(this.followEndpoint + '?user_id=' + this.myrallyID + '&representative_id=' + repID)
          .subscribe(result => {
            console.log("Notifications", result);
            if(result != ""){
              console.log(result[0].enable_notifications);
              if(result[0].enable_notifications == true){
                this.usersProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                this.presentToast("You've turned off notifications for this Representative");
              }else{
                this.usersProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                this.presentToast("You've turned on notifications for this Representative");

              }
            }else{
              this.presentToast("You need to follow this Representative to enable the notifications");
            }
          });
      }
}
