import { supabase } from './src/lib/supabase';

async function checkCMS() {
  try {
    const { data: banners, error: bError } = await supabase.from('banners').select('*');
    const { data: faqs, error: fError } = await supabase.from('faqs').select('*');
    const { data: results, error: rError } = await supabase.from('results').select('*');

    console.log('BANNERS:', banners, bError);
    console.log('FAQS:', faqs, fError);
    console.log('RESULTS:', results, rError);
  } catch (e) {
    console.error(e);
  }
}

checkCMS();
