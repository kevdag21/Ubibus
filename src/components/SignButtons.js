import { Button } from '@rneui/base'
import { StyleSheet, View, Text } from 'react-native'

export function SignButtons ({ navigation, userType }) {
  const moveToSignIn = () => navigation.navigate('SignIn', { userType })
  const moveToSignUp = userType === 'passenger' ? () => navigation.navigate('SignUpPassenger') : () => navigation.navigate('SignUpDriver')

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button
          title="INICIAR SESIÓN"
          onPress={() => moveToSignIn()}
          buttonStyle={styles.button}
          color="#FF7D3E"
        />
        <Button
          title="REGISTRARSE"
          onPress={() => moveToSignUp()}
          color="#FF7D3E"
          buttonStyle={styles.button}
        />
      </View>
      <Text
        style={styles.switchUserType}
        onPress={
          userType === "passenger"
            ? () =>
                navigation.navigate("DriverCarousel", {
                  animation: "slide_from_bottom",
                })
            : () =>
                navigation.navigate("PassengerCarousel", {
                  animation: "slide_from_bottom",
                })
        }
      >
        {userType === "passenger" ? "¿Eres concesionario?" : "¿Eres pasajero?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    borderRadius: 10,
    width: 167,
    height: 50
  },
  switchUserType: {
    color: 'red',
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 21
  }
})
