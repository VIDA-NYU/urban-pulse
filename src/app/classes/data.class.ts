import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

@Injectable()
export class DataService {

    private data : any;

    constructor(private http: Http) {
        
    }

    getFeatures() {
        return this.http.get('./data/nyc/flickr-features.json').map((res:any) => res.json());
    }
}
