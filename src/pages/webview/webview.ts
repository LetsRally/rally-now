import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';
import {FaxFeedBackPage} from '../fax-feed-back/fax-feed-back';
import {EmailFeedBackPage} from '../email-feed-back/email-feed-back';
import {DonateFeedBackPage} from '../donate-feed-back/donate-feed-back';
import {SignFeedBackPage} from '../sign-feed-back/sign-feed-back';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";
import * as constants from '../../constants/constants';

@IonicPage()
@Component({
    selector: 'page-webview',
    templateUrl: 'webview.html',
})
export class WebviewPage {
    url: any;
    actionType: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private sanitize: DomSanitizer,
        private themeableBrowser: ThemeableBrowser,
        public viewCtrl: ViewController,
    ) {

        this.url = navParams.get('iframeUrl');
        this.actionType = navParams.get('actionType');
        console.log(this.actionType);
        this.openWebpage(this.url);

    }

    ionViewWillEnter() {
        this.viewCtrl.showBackButton(false)
    }

    urlpaste(url) {
        return this.sanitize.bypassSecurityTrustResourceUrl(this.url);


    }

    openWebpage(url: string) {
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


    goToFeedBack() {
        if (this.actionType === 'fax') {
            this.navCtrl.push(FaxFeedBackPage);

        } else if (this.actionType === 'email') {
            this.navCtrl.push(EmailFeedBackPage);
        } else if (this.actionType === 'donate') {
            this.navCtrl.push(DonateFeedBackPage);
        } else {
            this.navCtrl.push(SignFeedBackPage);
        }
    }
}
