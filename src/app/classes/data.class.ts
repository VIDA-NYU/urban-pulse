import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// lodash
import * as _ from 'lodash';

@Injectable()
export class DataService {

    private data : any;
    private selected: any = [];

    constructor(private http: Http) { }
    
    getFeatures() {
        return this.http.get('./data/nyc/flickr-features.json').map((res:any) => res.json());
    }

    addSelection(elem: any) {
        if( !_.find(this.selected, x => x['id'] === elem['id']) )
            this.selected.push(elem);
    }

    delSelection(elem: any) {
        _.remove(this.selected, x => x['id'] === elem['id'] );
    }

    findSelection(elem: any) {
        return _.find(this.selected, x => x['id'] === elem['id']);
    }

    clearSelection() {
        this.selected = [];
    }

    getCities() {
    	return ['nyc', 'nyc'];
    }
}
