import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function quickCheck() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📊 Collections in database:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`   ${coll.name}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
  }
}

quickCheck();
