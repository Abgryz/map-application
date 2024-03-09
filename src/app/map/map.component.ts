import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import {Point} from "../../_interfaces/point";
import {NgForOf} from "@angular/common";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {

  map!: L.Map;
  routingControl!: L.Routing.Control;
  waypoints: L.LatLng[] = [];
  points: Point[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const map = L.map('map').setView([50.4501, 30.5234], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    this.map = map;
    this.initRoutingControl();

    this.map.on('click', this.onMapClick.bind(this));

  }

  initRoutingControl(): void {
    this.routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{color: 'blue', weight: 5}],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      fitSelectedRoutes: true
    }).addTo(this.map);
  }

  onMapClick(event: L.LeafletMouseEvent): void {
    const latlng = event.latlng;
    this.addPoint(latlng);
    this.updateRoute();
  }

  addPoint(latlng: L.LatLng): void {
    this.points.push({lat: latlng.lat, lng: latlng.lng});

    const marker = L.marker(latlng, {
      icon: L.icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      })
    }).addTo(this.map);

    marker.on('click', () => this.removePoint(marker));
  }

  removePoint(marker?: L.Marker, point?: Point): void {
    if (!marker) {
      if (point) {
        const index = this.points.findIndex(p => p === point);
        if (index !== -1) {
          this.points.splice(index, 1);
          this.map.removeLayer(L.marker([point.lat, point.lng]));
          this.updateRoute();
        }
      }
    } else {
      const pointI: Point = marker.getLatLng();
      const index = this.points.findIndex(p => p.lat === pointI.lat && p.lng === pointI.lng);
      if (index !== -1) {
        this.points.splice(index, 1);

        this.map.removeLayer(marker);
        this.updateRoute();
      }
    }
  }

  updateRoute(): void {
    if (this.points.length > 1) {
      this.waypoints = this.points.map(point => L.latLng(point.lat, point.lng));
      this.routingControl.setWaypoints(this.waypoints);
    } else {
      this.routingControl.setWaypoints([]);
    }
  }

}
