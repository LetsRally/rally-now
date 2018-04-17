export class FilterModel {
    zipcode: string;
    distance: any;
    timeStarts: string;
    timeEnds: string;
    filterBy: string;

    constructor() {
        this.zipcode = '98053';
        this.distance = 50;
        this.timeStarts = '';
        this.timeEnds = '';
        this.filterBy = 'all';
    }
}