import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eekynqwyeainvepuhciz.supabase.co'
const supabaseKey = 'sb_publishable_vkYSNqQSC2eqKTiCFj_5Ng_UTbJ--Xm'

export const supabase = createClient(supabaseUrl, supabaseKey)