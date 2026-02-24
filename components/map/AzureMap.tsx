'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as atlas from 'azure-maps-control';

export interface Terminal {
  name: string;
  latitude: number;
  longitude: number;
}

export interface TruckPin {
  label: string;
  latitude: number;
  longitude: number;
}

interface AzureMapProps {
  terminals: Terminal[];
  trucks: TruckPin[];
  isLoading: boolean;
}

// Continental US bounds
const US_BOUNDS: atlas.data.BoundingBox = [-125, 24, -66, 50];

export function AzureMap({ terminals, trucks, isLoading }: AzureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<atlas.Map | null>(null);
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null);
  const layerRef = useRef<atlas.layer.SymbolLayer | null>(null);
  const truckSourceRef = useRef<atlas.source.DataSource | null>(null);
  const truckLayerRef = useRef<atlas.layer.SymbolLayer | null>(null);
  const truckPopupRef = useRef<atlas.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || '';

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new atlas.Map(mapRef.current, {
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey,
      },
      center: [-98.5, 39.8],
      zoom: 3,
      style: 'road',
    });

    map.events.add('ready', () => {
      setMapReady(true);
    });

    mapInstance.current = map;

    return () => {
      map.dispose();
      mapInstance.current = null;
    };
  }, [subscriptionKey]);

  // Add terminal pins when data arrives
  const addTerminals = useCallback(() => {
    const map = mapInstance.current;
    if (!map || !mapReady || terminals.length === 0) return;

    // Remove previous custom layer and source
    if (layerRef.current) {
      map.layers.remove(layerRef.current);
      layerRef.current = null;
    }
    if (dataSourceRef.current) {
      map.sources.remove(dataSourceRef.current);
      dataSourceRef.current = null;
    }

    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);
    dataSourceRef.current = dataSource;

    terminals.forEach((t) => {
      const point = new atlas.data.Feature(
        new atlas.data.Point([t.longitude, t.latitude]),
        { name: t.name }
      );
      dataSource.add(point);
    });

    // Pin layer
    const symbolLayer = new atlas.layer.SymbolLayer(dataSource, undefined, {
      iconOptions: {
        image: 'pin-round-blue',
        anchor: 'center',
        allowOverlap: true,
      },
      textOptions: {
        textField: ['get', 'name'],
        offset: [0, 1.2],
        allowOverlap: false,
        size: 12,
        color: '#333',
        haloColor: '#fff',
        haloWidth: 1,
      },
    });

    map.layers.add(symbolLayer);
    layerRef.current = symbolLayer;

    // Add popup on hover
    const popup = new atlas.Popup({
      pixelOffset: [0, -18],
      closeButton: false,
    });

    map.events.add('mousemove', symbolLayer, (e: atlas.MapMouseEvent) => {
      if (e.shapes && e.shapes.length > 0) {
        const shape = e.shapes[0] as atlas.Shape;
        const props = shape.getProperties();
        const coords = (shape.getCoordinates() as atlas.data.Position);
        popup.setOptions({
          content: `<div style="padding:6px 10px;font-size:13px;font-weight:600">${props.name}</div>`,
          position: coords,
        });
        popup.open(map);
      }
    });

    map.events.add('mouseleave', symbolLayer, () => {
      popup.close();
    });

    // Zoom to fit all terminals with padding
    if (terminals.length > 1) {
      const positions = terminals.map((t) => [t.longitude, t.latitude] as atlas.data.Position);
      const bbox = atlas.data.BoundingBox.fromPositions(positions);
      map.setCamera({
        bounds: bbox,
        padding: 60,
        type: 'ease',
        duration: 1000,
      });
    } else if (terminals.length === 1) {
      map.setCamera({
        center: [terminals[0].longitude, terminals[0].latitude],
        zoom: 8,
        type: 'ease',
        duration: 1000,
      });
    }
  }, [mapReady, terminals]);

  // Add truck pins when data arrives
  const addTrucks = useCallback(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    // Remove previous truck layer and source
    if (truckLayerRef.current) {
      map.layers.remove(truckLayerRef.current);
      truckLayerRef.current = null;
    }
    if (truckSourceRef.current) {
      map.sources.remove(truckSourceRef.current);
      truckSourceRef.current = null;
    }
    if (truckPopupRef.current) {
      truckPopupRef.current.close();
      truckPopupRef.current = null;
    }

    if (trucks.length === 0) return;

    const truckSource = new atlas.source.DataSource();
    map.sources.add(truckSource);
    truckSourceRef.current = truckSource;

    trucks.forEach((t) => {
      const point = new atlas.data.Feature(
        new atlas.data.Point([t.longitude, t.latitude]),
        { label: t.label }
      );
      truckSource.add(point);
    });

    const truckLayer = new atlas.layer.SymbolLayer(truckSource, undefined, {
      iconOptions: {
        image: 'pin-round-red',
        anchor: 'center',
        allowOverlap: true,
        size: 0.8,
      },
    });

    map.layers.add(truckLayer);
    truckLayerRef.current = truckLayer;

    // Popup on hover for truck pins
    const popup = new atlas.Popup({
      pixelOffset: [0, -18],
      closeButton: false,
    });
    truckPopupRef.current = popup;

    map.events.add('mousemove', truckLayer, (e: atlas.MapMouseEvent) => {
      if (e.shapes && e.shapes.length > 0) {
        const shape = e.shapes[0] as atlas.Shape;
        const props = shape.getProperties();
        const coords = shape.getCoordinates() as atlas.data.Position;
        popup.setOptions({
          content: `<div style="padding:6px 10px;font-size:13px;font-weight:600">${props.label}</div>`,
          position: coords,
        });
        popup.open(map);
      }
    });

    map.events.add('mouseleave', truckLayer, () => {
      popup.close();
    });

    // Zoom to fit all points (terminals + trucks)
    const allPositions = [
      ...terminals.map((t) => [t.longitude, t.latitude] as atlas.data.Position),
      ...trucks.map((t) => [t.longitude, t.latitude] as atlas.data.Position),
    ];
    if (allPositions.length > 1) {
      const bbox = atlas.data.BoundingBox.fromPositions(allPositions);
      map.setCamera({
        bounds: bbox,
        padding: 60,
        type: 'ease',
        duration: 1000,
      });
    }
  }, [mapReady, trucks, terminals]);

  useEffect(() => {
    addTerminals();
  }, [addTerminals]);

  useEffect(() => {
    addTrucks();
  }, [addTrucks]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-muted-foreground">Loading terminals...</span>
          </div>
        </div>
      )}
    </div>
  );
}
