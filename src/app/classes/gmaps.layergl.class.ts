import { Injectable } from '@angular/core';

// import threejs
import * as THREE from 'three';

// layergl
import { LayerGL } from './layergl.class'

const getScriptSrc = (callbackName: string) => {
    return `https://maps.googleapis.com/maps/api/js?key=AIzaSyCP7UZDm9dXpxsDylKpchK6tfAFNGWk1tQ&callback=${callbackName}`
}

@Injectable()
export class GMapsLayerGL 
{
    private map: google.maps.Map;
    private layer: LayerGL;

    constructor() { }

    initMap(mapHtmlElement: HTMLElement, options: google.maps.MapOptions)
    {
        this.map = new google.maps.Map(mapHtmlElement, options);

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.resize(); });
    }

    initLayerGL()
    {
        this.layer = new LayerGL({ map: this.map }, function (layer: LayerGL) 
        {
            var geometry = new THREE.Geometry();
            var location = new google.maps.LatLng(40.7324607, -73.9887512);

            var vertex = layer.fromLatLngToVertex(location);
            geometry.vertices.push(vertex);

            var particleMaterial = new THREE.PointsMaterial( { color: 0xff8888 } );
            var particles = new THREE.Points(geometry, particleMaterial);
            layer.add(particles);
        });
    }

    setCenter(latLng: google.maps.LatLng) {
        if (this.map != null && latLng != null) {
            // Changes the center of the map to the given LatLng.
            this.map.panTo(latLng);
        }
    }

    setZoom(zoom: number) {
        if (this.map != null) {
            this.map.setZoom(zoom);
        }
    }
    
    private resize() {
        // Saves the center.
        let latLng: google.maps.LatLng = this.map.getCenter();
        // Triggers resize event.
        google.maps.event.trigger(this.map, "resize");
        // Restores the center.
        this.map.setCenter(latLng);
    }    
}