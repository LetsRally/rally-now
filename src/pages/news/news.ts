import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { UsersProvider } from '../../providers/users/users';
import { OrganizationsProvider } from '../../providers/organizations/organizations';
import { SocialShareProvider } from '../../providers/social-share/social-share';
import { DomSanitizer } from '@angular/platform-browser';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { RepresentativeProfilePage } from '../representative-profile/representative-profile';
import { ThanksPage } from '../thanks/thanks';
import { OrganizationProfilePage } from '../organization-profile/organization-profile';



@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {

  endpoint:any = 'news/';
  myRallyID:any;
  public records:any = [];
  private start:number=1;
  likeendpoint:any = 'likes';
  tweetLike:any = 'ab860ccb-9713-49e5-b844-34d18f92af21';
  favEndpoint:any = 'actions';
  disable:boolean = false;
  organizationEndpoint:any = 'following_organizations';
  shareAction:any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
  loader:boolean = false;
  enablePlaceholder:boolean = true;
  followEndpoint:any = 'following_representative';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public viewCtrl:ViewController,
    private httpProvider: OrganizationsProvider,
    private userProv: UsersProvider,
    public actionSheetCtrl: ActionSheetController,
    private shareProvider:SocialShareProvider,
    public modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private inAppBrowser: InAppBrowser,
    public toastCtrl: ToastController) {
    this.enablePlaceholder = true;

      this.userProv.returnRallyUserId().then(user => {
        this.myRallyID = user.apiRallyID;
        this.getdata();
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewsPage');
  }


  getdata(){
    
  

    return new Promise(resolve => {
      this.httpProvider.load(this.endpoint + this.myRallyID + '/', this.start)
        .then(data => {
          this.getArray(data);            
          resolve(true);
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

  findInLoop(actions){
    if (actions != null){
      var found = actions.some(el => { 
          return el == this.myRallyID;
        
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
          return el == this.myRallyID;
        
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
          return el == this.myRallyID;
        
      });
      
      if (!found){
        return '#b6b6b6';
        
      }else{
        return '#f2f2f2';
        
      }
    }

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


    this.httpProvider.getJsonData(this.followEndpoint+'?user_id='+this.myRallyID+'&representative_id='+repID)
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
    this.userProv.followRep(this.followEndpoint, this.myRallyID, repID);
  }
  
  unFollowRep(recordID){
    this.userProv.unfollowOrganization(this.followEndpoint, recordID);
  }
  

  goToRepProfile(repID){
    this.navCtrl.push(RepresentativeProfilePage, {repID: repID}, {animate:true,animation:'transition',duration:500,direction:'forward'});
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

  getLikeStatus($event, reference_id, like_type, likes){
    this.disable = true;

    this.userProv.getJsonData(this.likeendpoint+'?reference_id='+reference_id+'&user_id='+this.myRallyID).subscribe(
      result => {
        console.log($event);
        console.log("Aqui", $event.srcElement.lastChild.data);
        
        if(result != "" ){
          this.removeFav(result[0].id);
          $event.srcElement.style.backgroundColor = '#f2f2f2';
          $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
          $event.srcElement.lastChild.data--;
          $event.srcElement.children[0].className = 'icon icon-md ion-md-heart-outline';
          $event.srcElement.style.color = '#b6b6b6';
          
        }else{
         this.addLike(reference_id, like_type);
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
    this.userProv.addLike(this.likeendpoint, reference_id, this.myRallyID, like_type).subscribe(
      response =>{
          console.log(response);
          this.disable = false;
      });

  }

  removeFav(recordID){
    this.userProv.removeItem(this.likeendpoint, recordID).subscribe(res => {
      console.log(res);
      this.disable = false;
  
    }, err =>{
      console.log(err);
    });
    this.userProv.removeFollowRecordID(recordID, 'favorites');
  
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
          console.log("twitter: Success");
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

addShareAction(goal_id, action_type_id){
this.userProv.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myRallyID);
}

findInLoopTweet(actions){
if (actions != null){
  var found = actions.some(el => { 
      return el == this.myRallyID;
    
  });
  
  if (!found){
    return 'Follow';
    
  }else{
    return 'Following';
    
  }
}

}



      unfollowOrg(recordID, orgID){

        this.userProv.unfollowOrganization(this.organizationEndpoint, recordID);
        this.userProv.removeFollowRecordID(orgID, 'organizations');
      }

      followOrg(organizationID){
        this.userProv.followOrganization(this.organizationEndpoint, this.myRallyID, organizationID );
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

        notifyExist(actions){
          console.log("IDs", actions);
          if (actions != null){
            var found = actions.some(el => { 
                return el == this.myRallyID;
              
            });
            
            if (!found){
              return 'Turn on notifications for ';
              
            }else{
              return 'Turn off notifications for ';
              
            }
          }
        }

        checkNotifiersRep(repID){
          this.userProv.getJsonData(this.followEndpoint + '?user_id=' + this.myRallyID + '&representative_id=' + repID)
            .subscribe(result => {
              console.log("Notifications", result);
              if(result != ""){
                console.log(result[0].enable_notifications);
                if(result[0].enable_notifications == true){
                  this.userProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                }else{
                  this.userProv.updateSingleItem(this.followEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                }
              }
            });
        }

        goToOrganizationProfile(organizationID){
          this.navCtrl.push(OrganizationProfilePage, {
             organizationID: organizationID,
             OrgPageName: "Home"
       }, {animate:true,animation:'transition',duration:500,direction:'forward'});
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

        checkNotifiers(orgID){
          this.userProv.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myRallyID + '&organization_id=' + orgID)
            .subscribe(result => {
              console.log("Notifications", result);
              if(result != ""){
                console.log(result[0].enable_notifications);
                if(result[0].enable_notifications == true){
                  this.userProv.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                }else{
                  this.userProv.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                }
              }
            });
        }

        orgStatus(orgID){
          this.userProv.getJsonData(this.organizationEndpoint+'?follower_id='+this.myRallyID+'&organization_id='+orgID).subscribe(
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
        
        
              

        

}
