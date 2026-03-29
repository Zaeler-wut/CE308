import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location'; // เป็นไลบรารีสำหรับดึง GPS
import MapView, { Marker } from 'react-native-maps'; // แสดงแผนที่และหมุด

export default function App() {
  // ส่วนสำหรับเก็บพิกัด GPS มือถือ
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null); // ตำแหน่งเรา
  const [accuracy, setAccuracy] = useState<number | null>(null); //ความแม่นยำ GPS
  const [locked, setLocked] = useState(false); // ตำแหน่งถูกล็อคแม่นพอหรือยัง

  const mapRef = useRef<MapView>(null); // Ref สำหรับ MapView
  const MAX_MOVE = 0.00005; // ≈ 5 เมตร ใช้จำกัดการขยับ marker

  useEffect(() => {
    let sub: Location.LocationSubscription;

    const start = async () => {
      // ขออนุญาตเข้าถึง GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // ดึงพิกัดครั้งแรก
      let first = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      setLocation(first.coords); // อัปเดต state location
      setAccuracy(first.coords.accuracy ?? null); // อัปเดตความแม่นยำ

      // ติดตามพิกัดแบบเรียลไทม์
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // อัปเดตทุก 1 วินาที
          distanceInterval: 1, // อัปเดตทุก 1 เมตร
        },
        (loc) => {
          const coords = loc.coords; // พิกัด GPS ล่าสุด
          const acc = coords.accuracy ?? 999; // ความแม่นยำล่าสุด

          setAccuracy(acc); // อัปเดตความแม่นยำทุกครั้ง

          // ถ้ายังไม่ล็อค รอค่าที่แม่นพอ
          if (!locked) {
            if (acc < 10) {
              setLocation(coords); // อัปเดตตำแหน่งจริง
              setLocked(true); // ล็อคตำแหน่ง
            }
            return;
          }

          // หลังล็อค จำกัดการขยับ marker
          if (location) {
            const dLat = Math.abs(coords.latitude - location.latitude);
            const dLng = Math.abs(coords.longitude - location.longitude);

            // ถ้า GPS ขยับเกิน 5 เมตร ไม่อัปเดต
            if (dLat > MAX_MOVE || dLng > MAX_MOVE) {
              return;
            }
          }

          setLocation(coords); // อัปเดตตำแหน่งเล็กน้อยได้
        }
      );
    };

    start();

    return () => {
      if (sub) sub.remove();
    };
  }, [location, locked]);

  // 📍 ส่วนของปุ่มกลับไปยังตำแหน่งตัวเองได้
  const goToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    }
  };

  // รอ GPS
  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" /> {/* แสดง loading */}
        <Text>กำลังหาตำแหน่ง...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* แผนที่ */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true} // แสดงวงฟ้าของ GPS มือถือจริง
      >
        <Marker coordinate={location} title="ตำแหน่งของฉัน" /> {/* หมุดตัวเรา */}
      </MapView>

      {/* ปุ่มกลับตำแหน่ง */}
      <TouchableOpacity style={styles.button} onPress={goToMyLocation}>
        <Text style={styles.buttonText}>📍 ตำแหน่งของฉัน</Text>
      </TouchableOpacity>

      {/* ข้อมูล GPS */}
      <View style={styles.info}>
        <Text>Lat: {location.latitude.toFixed(6)}</Text>
        <Text>Lng: {location.longitude.toFixed(6)}</Text>
        <Text>Accuracy: {accuracy?.toFixed(2)} m</Text>
        <Text>{locked ? 'ล็อคตำแหน่งแล้ว' : 'กำลังหาค่าที่แม่น...'}</Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  button: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  info: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});