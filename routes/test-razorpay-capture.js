// Test script to verify Razorpay auto-capture is working
// Save this as: test-razorpay-capture.js
// Run with: node test-razorpay-capture.js

require('dotenv').config();
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testAutoCapture() {
    console.log("=== TESTING RAZORPAY AUTO-CAPTURE ===\n");
    
    try {
        // Test 1: Create order WITHOUT payment_capture
        console.log("Test 1: Creating order WITHOUT payment_capture (should default to manual capture)...");
        const orderWithoutCapture = await razorpayInstance.orders.create({
            amount: 100, // ₹1
            currency: "INR",
            receipt: `test_without_${Date.now()}`
        });
        
        console.log("✅ Order created WITHOUT auto-capture:");
        console.log("   Order ID:", orderWithoutCapture.id);
        console.log("   Payment Capture:", orderWithoutCapture.payment_capture);
        console.log("");
        
        // Test 2: Create order WITH payment_capture = 1
        console.log("Test 2: Creating order WITH payment_capture = 1 (should auto-capture)...");
        const orderWithCapture = await razorpayInstance.orders.create({
            amount: 100, // ₹1
            currency: "INR",
            receipt: `test_with_${Date.now()}`,
            payment_capture: 1 // Enable auto-capture
        });
        
        console.log("✅ Order created WITH auto-capture:");
        console.log("   Order ID:", orderWithCapture.id);
        console.log("   Payment Capture:", orderWithCapture.payment_capture);
        console.log("");
        
        // Test 3: Verify settings
        console.log("=== VERIFICATION ===");
        console.log("If payment_capture is 1 for Test 2, auto-capture is enabled!");
        console.log("If both show 0 or undefined, check Razorpay account settings.");
        console.log("");
        
        // Test 4: Check account capabilities
        console.log("Test 3: Checking Razorpay account capabilities...");
        try {
            // Try to fetch one of the orders to see full details
            const orderDetails = await razorpayInstance.orders.fetch(orderWithCapture.id);
            console.log("✅ Full order details:");
            console.log(JSON.stringify(orderDetails, null, 2));
        } catch (error) {
            console.log("⚠️ Could not fetch order details:", error.message);
        }
        
        console.log("\n=== TEST COMPLETE ===");
        console.log("\nNext steps:");
        console.log("1. If payment_capture = 1 for Test 2: Code is correct, test with real payment");
        console.log("2. If payment_capture = 0 or undefined: Razorpay account might have restrictions");
        console.log("3. Check Razorpay Dashboard → Settings → Payment Capture Mode");
        
    } catch (error) {
        console.error("❌ Error during test:");
        console.error("Message:", error.message);
        console.error("Details:", JSON.stringify(error, null, 2));
        
        if (error.error?.description) {
            console.error("Description:", error.error.description);
        }
    }
}

// Run the test
testAutoCapture();