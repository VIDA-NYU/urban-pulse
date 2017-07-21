import { Injectable } from '@angular/core';

// lodash
import * as _ from 'lodash';

@Injectable()
export class InteractionService
{
    private selected: any = [];

    constructor() {}

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
}