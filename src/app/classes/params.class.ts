import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

@Injectable()
export class ParametersService
{
    public  timeRes: string = 'HOUR';
    private timeResChange: EventEmitter<any> = new EventEmitter();
    
    public  showScalarFunction: boolean = true;
    private showScalarFunctionChange: EventEmitter<any> = new EventEmitter();
    
    public timeMax: number = 24;
    public timeSel: number = 1;
    private timeSelChange: EventEmitter<any> = new EventEmitter();

    public  searchId: string = "none";
    private searchIdChange: EventEmitter<any> = new EventEmitter();
    
    getTimeRes()
    {
        return this.timeRes;
    }

    getTimeResChangeEmitter()
    {
        return this.timeResChange;
    }

    emitTimeResChanged()
    {
        switch (this.timeRes) 
        {
            case "HOUR":
                this.timeMax = 24;
            break;        
            case "DAYOFWEEK":
                this.timeMax = 7;
            break;        
            case "MONTH":
                this.timeMax = 12;
            break;        
        } 

        this.timeResChange.emit(this.timeRes);
    }

    //--------

    getShowScalarFunction()
    {
        return this.showScalarFunction;
    }

    getShowScalarFunctionEmitter()
    {
        return this.showScalarFunctionChange;
    }

    emitShowScalarFunctionChanged()
    {
        this.showScalarFunctionChange.emit(this.showScalarFunction);
    }

    //--------

    getTimeSel()
    {
        return this.timeSel;
    }

    getTimeSelEmitter()
    {
        return this.timeSelChange;
    }

    emitTimeSelChanged()
    {
        this.timeSelChange.emit(this.timeSel);
    }

    //--------

    getSearchId()
    {
        return this.searchId;
    }

    getSearchIdEmitter()
    {
        return this.searchIdChange;
    }

    emitSearchIdChanged()
    {
        this.searchIdChange.emit(this.searchId);
    }
}