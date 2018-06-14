export class FilterModel {
    zipcode: string;
    distance: any;
    timeStarts: string;
    timeEnds: string;
    filterBy: string;

    constructor() {
        this.zipcode = '';
        this.distance = 50;
        this.timeStarts = '';
        this.timeEnds = '';
        this.filterBy = 'all';
    }
}