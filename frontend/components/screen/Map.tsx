import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import { reverseGeocodeNominatim, ReverseGeocodeResult } from '../../lib/geocode';

interface MapProps {
  latitude: number;
  longitude: number;
  title?: string; // fallback when POI unavailable
  description?: string; // fallback when formatted address unavailable
  onCoordinateChange?: (coord: { latitude: number; longitude: number }) => void;
  interactive?: boolean;
}

export default function Map({ latitude, longitude, title, description, onCoordinateChange, interactive = false }: MapProps) {
  const [poi, setPoi] = useState<ReverseGeocodeResult | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [latitude, longitude]);

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setGeocoding(true);
        const res = await reverseGeocodeNominatim(latitude, longitude, { signal: controller.signal });
        setPoi(res);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setPoi(null);
      } finally {
        setGeocoding(false);
      }
    }, 450);

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [latitude, longitude]);

  const handlePress = (evt: MapPressEvent) => {
    if (!interactive) return;
    const coord = evt.nativeEvent.coordinate;
    onCoordinateChange?.({ latitude: coord.latitude, longitude: coord.longitude });
  };

  const markerTitle = poi?.poiName || title || 'Vị trí giao hàng';
  const markerDescription = poi?.displayName || description || 'Địa chỉ bạn đã chọn';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handlePress}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={markerTitle}
          description={markerDescription}
        />
      </MapView>
      <View style={styles.poiOverlay} pointerEvents="none">
        <Text style={styles.poiTitle} numberOfLines={1}>
          {markerTitle}
        </Text>
        <Text style={styles.poiDesc} numberOfLines={2}>
          {geocoding ? 'Đang xác định địa điểm...' : markerDescription}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  poiOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  poiTitle: { fontSize: 13, fontWeight: '700', color: '#222' },
  poiDesc: { marginTop: 2, fontSize: 12, color: '#444' },
});
