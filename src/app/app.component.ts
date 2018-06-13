import { Component } from '@angular/core';
import {Platform, AlertController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { UserData } from '../providers/user-data';
import { Storage } from '@ionic/storage';
import {UsersProvider} from '../providers/users/users';
import { TabsPage } from '../pages/tabs/tabs';
declare var Appsee:any;


 
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any;


    constructor(
    	public platform: Platform,
    statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    public userData: UserData,
    public storage:Storage,
    private httpProvider:UsersProvider
) {

        this.userData.hasLoggedIn().then((hasLoggedIn) => {
            this.splashScreen.hide();
                if(hasLoggedIn){
                  this.rootPage = TabsPage;
                }
                else{
                  this.rootPage = HomePage;
                }
        }); 
        
        this.httpProvider.setToken().subscribe(data =>{
          localStorage.setItem('token', data.auth_token);
       
        });
          platform.ready().then((readySource) => {
            console.log("Platform Ready from ", readySource);
            statusBar.overlaysWebView(false);
            statusBar.backgroundColorByHexString('#f4512c');
            // Appsee.start("e81f4eb7b562458b80bbd8fb1f6130dc");
         
         });
    }
}