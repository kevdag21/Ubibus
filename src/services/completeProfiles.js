import { supabase } from './supabase'

export async function completePassengerProfile ({ id, name, phone, emergencyPhone }) {
  const { data, error } = await supabase.rpc('completePassengerProfile', {
    profiletoupdate: id,
    newname: name,
    newphone: phone,
    newemergencyphone: emergencyPhone
  })

  return { data, error }
}

