
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPayments() {
    console.log("Checking payment transactions...");

    const { data: payments, error } = await supabase
        .from('payment_transactions')
        .select('id, amount, payment_date, payment_month, payment_year, created_at');

    if (error) {
        console.error("Error fetching payments:", error);
        return;
    }

    console.log(`Found ${payments.length} payments.`);

    let total = 0;
    let febCount = 0;
    let febTotal = 0;

    const currentMonth_JS = new Date().getMonth() + 1; // 2 for Feb
    const currentYear_JS = new Date().getFullYear();   // 2026? User time is 2026-02-15

    console.log(`JS Current Date: ${new Date().toISOString()}`);
    console.log(`Target Month: ${currentMonth_JS}, Target Year: ${currentYear_JS}`);

    payments.forEach(p => {
        total += Number(p.amount);
        const isMatch = p.payment_month === currentMonth_JS && p.payment_year === currentYear_JS;

        if (isMatch) {
            febCount++;
            febTotal += Number(p.amount);
        }

        console.log(`Payment: ${p.amount} | Date: ${p.payment_date} | Stored Month: ${p.payment_month} | Stored Year: ${p.payment_year} | Expected: ${isMatch ? '✅' : '❌'}`);
    });

    console.log('--- Summary ---');
    console.log(`Total Revenue: ${total}`);
    console.log(`Current Month Revenue (JS Calc): ${febTotal}`);
}

checkPayments();
