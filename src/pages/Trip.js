import React, { useCallback, useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Text, Alert, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native'
import { Button } from '@rneui/themed'

import { supabase } from '../services/supabase'

import TripContainer from '../components/TripContainer'
import { ModalPayOffDebt } from '../components/ModalPayOffDebt'

import UserContext from '../context/UserContext'
import tripStatus from '../utils/tripStatus'

export default function Trip () {
  const { userData } = useContext(UserContext)
  const [trip, setTrip] = useState([])
  const [stat, setStats] = useState([{}])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const getTrip = async () => {
      const { data } = await supabase
        .from('trip')
        .select()
        .gte('idstatus', tripStatus.COMPLETED)
        .order('done_on', { ascending: false })
        .limit(5)
      setTrip(data)
    }
    getTrip()
  }, [])

  useFocusEffect(
    useCallback(() => {
      let isActive = true

      const fetchStats = async () => {
        const { data } = await supabase.rpc('getStats', { userid: userData.id })
        if (isActive) setStats(data)
      }

      fetchStats()

      return () => { isActive = false }
    }, [userData.id])
  )

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.rpc('getStats', { userid: userData.id })
      setStats(data)
    }
    if (!showModal) fetchStats()
  }, [showModal])

  const filterTrips = (range) => {
    const getFilterTrip = async () => {
      const { data, error } = await supabase.rpc(range, { rowstoshow: 15 })

      if (error) console.log('filterTrips: ', error)

      setTrip(data)
    }
    getFilterTrip()
  }

  const handlePayOff = async () => {
    if (stat.debt === '$0.00') {
      Alert.alert('Felicidades', 'No debes nada, sigue así')
      return
    }

    setShowModal(true)
  }

   const getImage1 = () => {
        return require("../../assets/Viaje.png");
    };

       const getImage2 = () => {
         return require("../../assets/Viaje2.png");
       };
  return (
    <View style={styles.container}>
      <ModalPayOffDebt
        visible={showModal}
        onPress={() => setShowModal(false)}
        amount={stat.debt}
      />
      <View style={styles.filterSection}>
        <Text style={[styles.title]}>Mis camiones</Text>
        <View style={styles.filterButons}>
          <Button
            title="Ruta"
            onPress={() => filterTrips("getTripsToday")}
            color="#FFFFFF"
            titleStyle={{ color: "#000000" }}
            style={styles.buttons}
          />
          <Button
            title="Camión"
            onPress={() => filterTrips("getTripsThisWeek")}
            color="#FFFFFF"
            titleStyle={{ color: "#000000" }}
            style={styles.buttons}
          />
          <Button
            title="Todos"
            color="#FFFFFF"
            titleStyle={{ color: "#000000" }}
            onPress={() => filterTrips("getTripsThisMonth")}
            style={styles.buttons}
          />
          <Button
            title="$2500 ganado"
            color="#FFFFFF"
            titleStyle={{ color: "#000000" }}
            onPress={() => filterTrips("getTripsThisYear")}
            style={styles.buttons}
          />
        </View>
      </View>
      <Image source={getImage1()} style={styles.img} resizeMode="contain" />
      <Image source={getImage2()} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 45,
    color: "#FFF",
    marginTop: 100,
    marginLeft: 10,
  },
  filterSection: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#FF7D3E",
    padding: 0,
    height: 230,
  },
  statsSection: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#FF7D3E",
    padding: 0,
    height: 100,
    zIndex: 1,
  },
  filterButons: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
    marginTop: 20,
  },
  statsButtons: {
    flexDirection: "row",
    maxWidth: "20%",
    margin: "1%",
  },
  tripSection: {
    backgroundColor: "#FFF",
    marginTop: 20,
    zIndex: 2,
  },
  buttons: {
    padding: 0,
    margin: 0,
     
  },
    img: {
    height: 197,
    width: "100%",
    alignSelf: "center",
  },
});
