import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { SignIn } from '../pages/SignIn'
import { SignUpPassenger } from '../pages/SignUpPassenger'
import { GoBackButton } from '../components/GoBackButton'

const Stack = createNativeStackNavigator()

export function Auth () {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: '#FFF'
      }
    }}
    >

     
      <Stack.Group screenOptions={{
        headerShown: true,
        title: '',
        headerShadowVisible: false
      }}
      >
        <Stack.Screen name='SignIn' component={SignIn} />
        <Stack.Screen name='SignUpPassenger' component={SignUpPassenger} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
