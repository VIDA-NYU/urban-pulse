import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// import d3js
import * as d3 from 'd3';

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

    addSelection(elem: any) 
    {
        if(typeof this.selected === "undefined") this.selected = [];

        if( !_.find(this.selected, x => x['id'] === elem['id']) )
            this.selected.push(elem);
    }
    
    delSelection(elem: any) 
    {
        if(typeof this.selected === "undefined") this.selected = [];

        _.remove(this.selected, x => x['id'] === elem['id'] );
    }
    
    findSelection(elem: any) 
    {
        if(typeof this.selected === "undefined") this.selected = [];
        
        return _.find(this.selected, x => x['id'] === elem['id']);
    }
    
    clearSelection() 
    {
        this.selected = undefined;
    }

    emitSelection()
    {
        this.selectionChange.emit(this.selected);        
    }
}