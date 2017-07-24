import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

@Injectable()
export class FilterService
{
    // scatter selection and emitter
    private scatterSelection: any = [];
    private scatterSelectionChange: EventEmitter<any> = new EventEmitter();

    // pulse time selection and emitter
    private pulseTimeSelection: any = [];
    private pulseTimeSelectionChange: EventEmitter<any> = new EventEmitter();

    // constructor
    constructor() {}

    // Scatter plot brush ---------

    getScatterSelectionChangeEmitter() {
        return this.scatterSelectionChange;
    }

    addToScatterSelection(elem: any) 
    {
        if(typeof this.scatterSelection === "undefined") this.scatterSelection = [];

        if( !_.find(this.scatterSelection, x => x['id'] === elem['id']) )
            this.scatterSelection.push(elem);
    }
    
    delFromScatterSelection(elem: any) 
    {
        if(typeof this.scatterSelection === "undefined") this.scatterSelection = [];

        _.remove(this.scatterSelection, x => x['id'] === elem['id'] );
    }
    
    findOnScatterSelection(elem: any) 
    {
        if(typeof this.scatterSelection === "undefined") this.scatterSelection = [];
        
        return _.find(this.scatterSelection, x => x['id'] === elem['id']);
    }
    
    clearScatterSelection() 
    {
        this.scatterSelection = undefined;
    }

    emitScatterSelectionChanged()
    {
        this.scatterSelectionChange.emit(this.scatterSelection);        
    }

    //-----------------------------
    // Pulse time selector --------

    getPulseTimeSelectionChangeEmitter()
    {
        return this.pulseTimeSelectionChange;
    }

    addToPulseTimeSelection(time: any) 
    {
    }

    delFromPulseTimeSelection(time: any) 
    {
    }

    findOnPulseTimeSelection(time: any) 
    {
    }

    clearPulseTimeSelection()
    {

    }

    emitPulseTimeSelectionChanged()
    {
        this.pulseTimeSelectionChange.emit([]);
    }
    
    //-----------------------------
}