import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {FirebaseAnalytics} from "@ionic-native/firebase-analytics";

@Injectable()
export class EventLoggerProvider {

    constructor(public fba: FirebaseAnalytics) {
        console.log('Hello EventLoggerProvider Provider');
    }

    logButton(name: string, value: any) {
        this.fba.logEvent(name, {pram: value})
            .then((res: any) => {
                console.log(res);
            })
            .catch((error: any) => console.error(error));
    }

}
