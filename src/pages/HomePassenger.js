import { useContext, useEffect } from 'react'
import { StyleSheet, View, Image } from 'react-native'

import UserContext from '../context/UserContext'
import SignInLikeContext from '../context/SingInLikeContext'

import { PassengerMapContainer } from '../components/PassengerMapContainer'
import useCurrentLocation from '../hooks/useCurrentLocation'

function HomePassenger ({ navigation }) {
  const { userData, dataIsLoaded } = useContext(UserContext)
  const { signInLike } = useContext(SignInLikeContext)
  const { location } = useCurrentLocation()

    const getImage = () => {
     return require("../../assets/mapa.png");
    };

  useEffect(() => {
    if (dataIsLoaded && !userData.idUserType) {
      navigation.navigate('CompletePassengerProfile')
    }
  }, [dataIsLoaded])

  return (
    <View style={styles.container}>
      <PassengerMapContainer currentLocation={location} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
  },
});

export { HomePassenger }
