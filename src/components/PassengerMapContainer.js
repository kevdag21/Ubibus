import { useState, useContext, useEffect, useRef } from 'react'
import { StyleSheet, View, Dimensions, Alert } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { useNavigation } from '@react-navigation/native'
import { confirmPayment, initStripe } from '@stripe/stripe-react-native'

import { SearchBar } from './SearchBar'
import { ManageTripPassenger } from './ManageTripPassenger'
import { ModalRating } from './ModalRating'
import { ModalTip } from './ModalTip'
import { ToEndpointPassenger } from './ToEndpointPassenger'
import { ModalDriverArrived } from './ModalDriverArrived'
import WonderSelector from './WonderSelector'
import PayChildrenSelector from './PayChildrenSelector'
import WaitSelector from './WaitSelector'

import { supabase } from '../services/supabase'

import { calculateTripCost } from '../services/calculateTripCost'
import { createPaymentIntent } from '../services/stripe'
import { getPublishableKey } from '../services/getPublishableKey'

import UserContext from '../context/UserContext'

import tripStatus from '../utils/tripStatus'
import paymentMethodType from '../utils/paymentMethodType'

export function PassengerMapContainer({ currentLocation }) {
  const { userData } = useContext(UserContext)
  const [searchLocation, setSearchLocation] = useState(null)
  const [showWonderSelector, setShowWonderSelector] = useState(false)
  const [showPaySelector, setShowPaySelector] = useState(false)
  const [showWaitSelector, seShowWaitSelector] = useState(false)
  const [showManageTrip, setShowManageTrip] = useState(false)
  const [wonders, setWonders] = useState(null)
  const [serviceSelected, setService] = useState(null)
  const [trip, setTrip] = useState(null)
  const [driver, setDriver] = useState(null)
  const [showModalDriverArrived, setShowModalDriverArrived] = useState(false)
  const [showToEndpoint, setShowToEndpoint] = useState(false)
  const [showModalRating, setShowModalRating] = useState(false)
  const [showModalTip, setShowModalTip] = useState(false)
  const [driverLocation, setDriverLocation] = useState(null)
  const [showSearchBar, setShowSearchBar] = useState(true)

  const tripChannel = useRef(null)
  const driverChannel = useRef(null)
  const clientSecret = useRef(null)

  const navigation = useNavigation()

  useEffect(() => {
    const fetchKey = async () => {
      const publishableKey = await getPublishableKey()
      await initStripe({ publishableKey })
    }
    fetchKey()
  }, [])

  const handleOnSelectEndpoint = async ({ distance }) => {
    const wonders = await calculateTripCost(distance)
    setWonders(wonders)
  }

  const handleSearch = (searchLocation) => {
    setSearchLocation(searchLocation)
    setShowWonderSelector(true)
  }

  const handleSelectWonder = (id) => {
    setShowSearchBar(false)
    setService(id)
    setShowWonderSelector(false)
    setShowPaySelector(true)
    setShowModalRating(true);
  }

  const handleConfirmTrip = async ({ childrenNumber, paymentMethodSelected }) => {
    if (paymentMethodSelected === paymentMethodType.CARD && !userData.idStripe) {
      Alert.alert('Advertencia', 'Debes agregar por lo menos una tarjeta')
      navigation.navigate('Cards')
      return
    }

    const { data: [trip], error } = await supabase.from('trip')
      .insert({
        name_startingpoint: (currentLocation.street) ? currentLocation.street.concat(' #', currentLocation.streetNumber) : currentLocation.name,
        name_endpoint: searchLocation.name,
        startingpoint: `POINT(${currentLocation.coords.longitude} ${currentLocation.coords.latitude})`,
        endpoint: `POINT(${searchLocation.lng} ${searchLocation.lat})`,
        children: childrenNumber,
        cost: wonders.find(({ id }) => id === serviceSelected).price,
        idpassenger: userData.id,
        idstatus: tripStatus.DRAFT,
        idservicetype: serviceSelected,
        idpaymentmethodtype: paymentMethodSelected
      })
      .select('id')

    if (error) {
      console.log(error)
      return
    }

    setTrip(trip.id)
    listenTripChanges(trip.id)
    setShowPaySelector(false)
    seShowWaitSelector(true)
  }

  const listenTripChanges = (trip) => {
    const newChannel = supabase
      .channel('trip')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trip', filter: `id=eq.${trip}` }, onTripChange)
      .subscribe()

    tripChannel.current = newChannel
  }

  const stopListeningTripChanges = () => {
    if (tripChannel.current) supabase.removeChannel(tripChannel.current)
    tripChannel.current = null
  }

  const handleCancel = async () => {
    stopListeningTripChanges()
    stopListeningDriverLocation()
    setDriver(null)
    setDriverLocation(null)
    setShowSearchBar(true)

    const { error } = await supabase.from('trip').update({
      idstatus: tripStatus.CANCELLED
    }).eq('id', trip)

    if (error) console.log('handleCancel', error)

    setTrip(null)
    seShowWaitSelector(false)
    setShowManageTrip(false)
    setSearchLocation(null)
  }

  const onTripChange = async ({ new: { idstatus, iddriver } }) => {
    if (idstatus === tripStatus.CONFIRMED) {
      const driver = await fetchDriver(iddriver)
      setDriver(driver)
      seShowWaitSelector(false)
      setShowManageTrip(true)
      listenDriverLocation(driver)

      const amount = Math.trunc(wonders.find(({ id }) => id === serviceSelected).price * 100)

      const { paymentIntent, error } = await createPaymentIntent({ idCustomer: userData.idStripe, idAccount: driver.idstripe, amount })
      if (error) console.log(error)

      clientSecret.current = paymentIntent
    } else if (idstatus === tripStatus.ARRIVED) {
      setShowModalDriverArrived(true)
    } else if (idstatus === tripStatus.STARTED) {
      setShowModalDriverArrived(false)
      setShowManageTrip(false)
      setShowToEndpoint(true)
    } else if (idstatus === tripStatus.COMPLETED) {
      setShowToEndpoint(false)
      setShowModalRating(true)
      stopListeningDriverLocation()
      setDriverLocation(null)
      setShowSearchBar(true)
      const { error } = await confirmPayment(clientSecret.current)
      if (error) console.log('confirmPayment', error)
    }
  }

  const fetchDriver = async (id) => {
    const { data: [driver] } = await supabase.from('profile').select('*').eq('id', id)
    return driver
  }

  const listenDriverLocation = (driver) => {
    const newChannel = supabase
      .channel('driver-location')
      .on('broadcast', { event: driver.id }, onDriverLocation)
      .subscribe()

    driverChannel.current = newChannel
  }

  const onDriverLocation = ({ payload: { latitude, longitude } }) => {
    setDriverLocation({ latitude, longitude })
  }

  const stopListeningDriverLocation = () => {
    if (driverChannel.current) supabase.removeChannel(driverChannel.current)
    driverChannel.current = null
  }

  const handleOnPressRating = (rating) => {
    setShowModalRating(false)
    setSearchLocation(null)
    setTrip(null)
    stopListeningTripChanges()

    if (rating >= 4) {
      setShowModalTip(true)
      return
    }

    setDriver(null)
    setShowSearchBar(true);

  }

  const handleOnPressTip = () => {
    setShowModalTip(false)
    setDriver(null)
  }

  return (
    <View style={styles.container}>
      <ModalDriverArrived visible={showModalDriverArrived} driver={driver} />
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.mapStyle}
        initialRegion={{
          latitude: 18,
          longitude: -94,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType="standard"
      >
        <Marker
          draggable
          coordinate={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }}
          title="Yo"
          pinColor="green"
        />
        {searchLocation && (
          <>
            <MapViewDirections
              origin={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
              destination={{
                latitude: searchLocation.lat,
                longitude: searchLocation.lng,
              }}
              apikey="AIzaSyDNg52BASakvP6Os7gOxyk3ccAvYMsjKu4"
              strokeWidth={3}
              strokeColor="green"
              onReady={handleOnSelectEndpoint}
            />
            <Marker
              draggable={false}
              coordinate={{
                latitude: searchLocation.lat,
                longitude: searchLocation.lng,
              }}
              title="Marcador"
              pinColor="orange"
            />
          </>
        )}
      </MapView>
      {showSearchBar && (
        <SearchBar currentLocation={currentLocation} onSearch={handleSearch} />
      )}
      {showWonderSelector && (
        <WonderSelector
          origin={
            currentLocation.street
              ? currentLocation.street.concat(
                  " #",
                  currentLocation.streetNumber
                )
              : currentLocation.name
          }
          destination={searchLocation.name}
          onSelectWonder={handleSelectWonder}
        />
      )}
      {showModalRating && (
        <ModalRating
          userToRate={driver?.id}
          visible={showModalRating}
          onPress={handleOnPressRating}
        />
      )}
      {showToEndpoint && <ToEndpointPassenger driver={driver} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
})
