// import threejs
import * as THREE from 'three';

// import threejs types
import { OrthographicCamera, Scene, WebGLRenderer, Geometry, Vector3 } from 'three';

export class LayerGL extends google.maps.OverlayView 
{
    // configuration
    private options: any;
    private width: number;
    private height: number;

    // threejs objects
    private camera: OrthographicCamera;
    private scene: Scene;
    private renderer: WebGLRenderer;
    private canvas: HTMLCanvasElement;

    // google maps elements
    private changeHandler: google.maps.MapsEventListener;
    private map: google.maps.Map|google.maps.StreetViewPanorama;

    // auxiliar elements
    private callback: any;
    private firstRun: boolean;
    private animationFrame: number;

    constructor(options: any, callback?: Function) 
    {
        super();

        this.callback = callback;
        this.initialize(options || {});

        this.firstRun = true;

        if (options.map) 
        {
            this.setMap(options.map);
        }
    }

    initialize(options: any)
    {
        this.options = options;

        this.camera = new THREE.OrthographicCamera(0, 256, 256, 0, -3000, 3000);
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer(
        {
            alpha: true,
            clearColor: 0xff0000,
            clearAlpha: 0
        });

        this.canvas = this.renderer.domElement;
    }

    onAdd()
    {
        this.getPanes().overlayLayer.appendChild(this.canvas);
        this.map = super.getMap();

        this.changeHandler = google.maps.event.addListener
        (
            this.map,
            'bounds_changed',
            this.draw
        );

        this.draw();        
    }

    onRemove()
    {
        if (!this.map) return; 

        this.map = null;
        this.canvas.parentElement.removeChild(this.canvas);

        if (this.changeHandler) 
        {
            google.maps.event.removeListener(this.changeHandler);
            this.changeHandler = null;
        }
    }

    draw()
    {
        if (!this.map) return;

        var bounds = (<google.maps.Map>this.map).getBounds();

        var topLeft = new google.maps.LatLng
        (
            bounds.getNorthEast().lat(),
            bounds.getSouthWest().lng()
        );

        var projection = this.getProjection();
        var point = projection.fromLatLngToDivPixel(topLeft);
        var width = projection.getWorldWidth();
        var center = ( (<google.maps.Map>this.map).getCenter().lng() % 360 + 360 ) % 360;

        if ( bounds.getSouthWest().lng() == -180 && bounds.getNorthEast().lng() == 180 && center < 180) 
        {
            point.x -= width;
        }

        this.canvas.style['transform'] = 'translate(' +
            Math.round(point.x) + 'px,' +
            Math.round(point.y) + 'px)';

        if (this.firstRun) 
        {
            this.firstRun = false;
            if (this.callback) this.callback(this);
        }

        this.update();
    }

    resize()
    {
        if (!this.map) return; 

        var div = (<google.maps.Map>this.map).getDiv();
        var width  = div.clientWidth;
        var height = div.clientHeight;

        if (width == this.width && height == this.height) return; 

        this.width  = width;
        this.height = height;

        this.renderer.setSize(width, height);
        this.update();        
    }

    update()
    {
        var projection = (<google.maps.Map>this.map).getProjection(),
            zoom, scale, offset, bounds, topLeft;

        if (!projection) { return; }

        bounds = (<google.maps.Map>this.map).getBounds();

        topLeft = new google.maps.LatLng
        (
            bounds.getSouthWest().lat(),
            bounds.getSouthWest().lng()
        );

        zoom = this.map.getZoom();
        scale = Math.pow(2, zoom);
        offset = projection.fromLatLngToPoint(topLeft);

        if 
        (
            bounds.getCenter().lng() <
            bounds.getSouthWest().lng()
        ) 
        {
            offset.x -= 256;
        }

        this.resize();

        this.camera.position.x = offset.x;
        this.camera.position.y = 255 - offset.y;

        this.camera.scale.x = this.width / 256 / scale;
        this.camera.scale.y = this.height / 256 / scale;

        this.render();
    }

    render()
    {
        if (typeof this === "undefined") return;

        // console.log(this);
        
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame( () => this.deferredRender() );
    }

    deferredRender()
    {
        if (typeof this.options.render == "function")
        {
            this.options.render();
        } 
        else 
        {
            this.renderer.render( this.scene, this.camera );
        }        
    }

    addToScene()
    {    
        var geometry = new THREE.Geometry();
        var location = new google.maps.LatLng(40.7324607 + Math.random()*0.002, -73.9887512 + Math.random()*0.002);

        var vertex = this.fromLatLngToVertex(location);
        geometry.vertices.push(vertex);

        var particleMaterial = new THREE.PointsMaterial( { color: 0xf00000, size: 100 } );
        var particles = new THREE.Points(geometry, particleMaterial);

        this.scene.add(particles);
        this.update();                
    }

    clearScene()
    {
        while(this.scene.children.length > 0) 
            this.scene.remove(this.scene.children[0]);             
        this.update();        
    }

    fromLatLngToVertex(latLng: google.maps.LatLng): Vector3
    {
        var projection = (<google.maps.Map>this.map).getProjection();
        var point = projection.fromLatLngToPoint(latLng);
        var vertex = new THREE.Vector3();

        vertex.x = point.x;
        vertex.y = 255 - point.y;
        vertex.z = 0;

        return vertex;
    };
}