import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {Facebook} from '@ionic-native/facebook';

@Injectable()
export class DataProvider {

    items: any;

    constructor(public http: Http,
                private facebook: Facebook) {
        console.log('Hello DataProvider Provider');
        this.getFacebookFriendsList();
    }

    getFacebookFriendsList() {
        this.facebook.api('me/friends', ['user_friends']).then(
            list => {
                console.log("Lista de amigos", list['data']);
                this.items = list['data'];
            }, error => {
                console.log("error", error);
            });
    }

    filterItems(searchTerm) {
        return this.items;

        // return this.items.filter((item) => {
        //     return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        // });     

    }

    getCurrentDate() {
        var today = new Date();
        var dd: any = today.getDate();
        var mm: any = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var next_year = today.getFullYear() + 1;

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        let currentDate = yyyy + '-' + mm + '-' + dd;
        let nextYear = next_year + '-' + mm + '-' + dd;

        return {
            currentDate: currentDate,
            nextYear: nextYear
        }
    }

    getZipCodes(code) {
        let url = 'https://api.trade.gov/ita_zipcode_to_post/search?api_key=RUX3XxTYsJMW0_1CHfbKJtay&zip_codes=' + code;
        return new Promise((resolve, reject) => {
            this.http.get(url)
                .map(res => res.json())
                .subscribe((data) => {
                    if (data && data.results && data.results.length === 1 && data.results[0].country === "US") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }, err => {
                    reject(false);
                });
        });
    }

    linkify(inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;

        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a class="link-to" href="$1" target="_blank">$1</a>');

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a class="link-to" href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a class="link-to" href="mailto:$1">$1</a>');

        return replacedText;
    }

}
