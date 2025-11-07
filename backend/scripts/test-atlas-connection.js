import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('🧪 Testing MongoDB Atlas Connection...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('URI:', MONGO_URI.replace(/:[^:]*@/, ':****@')); // Hide password
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('');
    console.log('📊 Database Info:');
    console.log(`   Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
    console.log('');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:');
    if (collections.length === 0) {
      console.log('   (No collections yet - database is empty)');
    } else {
      collections.forEach(col => {
        console.log(`   ✓ ${col.name}`);
      });
    }
    console.log('');
    
    // Count documents in each collection
    if (collections.length > 0) {
      console.log('📈 Document Counts:');
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   ${col.name}: ${count} documents`);
      }
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test Complete - Atlas is ready to use!');
    
  } catch (error) {
    console.log('');
    console.log('❌ Connection Failed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Solution:');
      console.log('   1. Check your password in .env file');
      console.log('   2. Make sure to URL-encode special characters:');
      console.log('      @ → %40, # → %23, % → %25');
      console.log('   3. Verify username is correct: swayamvernekar');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.log('💡 Solution:');
      console.log('   1. Add your IP address in Atlas Network Access');
      console.log('   2. Go to: Atlas → Network Access → Add IP Address');
      console.log('   3. Choose "Add Current IP" or "0.0.0.0/0" for testing');
    } else if (error.message.includes('user is not allowed')) {
      console.log('💡 Solution:');
      console.log('   1. Go to Atlas → Database Access');
      console.log('   2. Create user: swayamvernekar');
      console.log('   3. Set password and give readWrite access');
    }
    
    console.log('');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
