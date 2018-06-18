import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Platform} from "ionic-angular";
import {Keyboard} from "@ionic-native/keyboard";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/map';
import {Http} from "@angular/http";

@Component({
    selector: 'google-autocomplete',
    templateUrl: 'google-autocomplete.html'
})
export class GoogleAutocompleteComponent {

    @Input('key') key: string;
    @Input() placeholderText: string;
    @Output() searchResult = new EventEmitter();

    public searchTerm = '';
    public searchTerm$: Subject<string>;
    public places = [];
    public displayPlaces = false;
    public place = '';
    public enablePlaceholder = true;
    public noResults = false;
    private endpoint = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=';

    constructor(private platform: Platform,
                private http: Http,
                private keyboard: Keyboard) {
        this.searchTerm$ = new Subject<string>();
    }

    onSearchInput() {
        console.log(this.key);
        console.log(this.placeholderText);
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        if (this.searchTerm === "") {
            this.places = [];
        } else {
            this.places = [];
            this.enablePlaceholder = true;
            this.displayPlaces = false;
            this.searchTerm$.next(`${proxyurl}${this.endpoint}${this.searchTerm}&types=address&language=en&limit=10&components=country:us|country:pr|country:vi&key=${this.key}`);
            this.getSubjectJson(this.searchTerm$).subscribe((res) => {
                this.places = res.predictions;
                this.showMessage(res);
            });
        }
    }

    showMessage(res) {
        if(this.places.length) {
            this.displayPlaces = true;
        }

        if(res.status === "ZERO_RESULTS") {
            this.noResults = true;
            this.displayPlaces = false;
        } else {
            this.noResults = false;
        }
    }

    getSubjectJson(terms: Observable<string>) {
        return terms.switchMap(term => {
            return this.http.get(term).map(res => res.json());
        });
    }

    selectPlace(place) {
        this.displayPlaces = false;
        this.searchTerm = place;
        this.searchResult.emit(place);
    }

    cancel() {
        if (this.platform.is('ios')) {
            this.keyboard.onKeyboardShow().take(1).subscribe(() => {
                this.keyboard.close();
            });
        }

    }

}
