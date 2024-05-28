import { useContext } from 'react'
import { DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer'

import { Cards } from './Cards'
import { Profile } from './Profile'

import UserContext from '../context/UserContext'

import userType from '../utils/userType'

import { supabase } from '../services/supabase'

import { HomePassenger } from '../pages/HomePassenger'

const Drawer = createDrawerNavigator()

function CustomDrawerContent (props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label='Cerrar sesión'
        onPress={async () => await supabase.auth.signOut()}
      />
    </DrawerContentScrollView>
  )
}

function SideBar () {
  const { userData: { idUserType } } = useContext(UserContext)

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTitle: "",
        headerTransparent: true,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Mapa"
        component={HomePassenger}
      />
      <Drawer.Screen name="Información de usuario" component={Profile} />
      <Drawer.Screen
        name="Métodos de pago"
        component={Cards}
      />
    </Drawer.Navigator>
  );
}

export { SideBar }
