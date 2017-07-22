import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// lodash
import * as _ from 'lodash';

@Injectable()
export class FilterService
{
    private selected: any = [];
    private selectionChange: EventEmitter<any> = new EventEmitter();

    constructor() {}

    getSelectionChangeEmitter() {
        return this.selectionChange;
    }

    addSelection(elem: any) {
        if( !_.find(this.selected, x => x['id'] === elem['id']) )
            this.selected.push(elem);

        this.selectionChange.emit(this.selected);
    }
    
    delSelection(elem: any) {
        _.remove(this.selected, x => x['id'] === elem['id'] );

        this.selectionChange.emit(this.selected);
    }
    
    findSelection(elem: any) {
        return _.find(this.selected, x => x['id'] === elem['id']);
    }
    
    clearSelection() {
        this.selected = [];
        this.selectionChange.emit(this.selected);
    }    
}