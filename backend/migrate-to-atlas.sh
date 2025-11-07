#!/bin/bash

# MongoDB Atlas Migration Helper Script
# Helps you migrate from local MongoDB to MongoDB Atlas

echo "🌐 MongoDB Atlas Migration Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ No .env file found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your Atlas connection string."
    exit 1
fi

# Check if MongoDB Atlas URI is configured
if grep -q "mongodb+srv://" .env; then
    echo "✅ MongoDB Atlas connection string found in .env"
else
    echo "⚠️  No Atlas connection string found in .env"
    echo ""
    echo "Please add your MongoDB Atlas connection string to .env:"
    echo ""
    echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/f1app?retryWrites=true&w=majority"
    echo ""
    echo "📖 See MONGODB_ATLAS_SETUP.md for detailed instructions"
    exit 1
fi

echo ""
echo "🎯 What would you like to do?"
echo ""
echo "1) Upload CSV data to Atlas"
echo "2) Export local MongoDB and import to Atlas"
echo "3) Just test Atlas connection"
echo "4) Cancel"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📤 Uploading CSV data to MongoDB Atlas..."
        node scripts/upload-csvs-to-mongo.js
        ;;
    2)
        echo ""
        echo "💾 Exporting from local MongoDB..."
        
        # Create backup directory
        mkdir -p ~/f1app-atlas-backup
        
        # Export from local
        mongodump --db f1app --out ~/f1app-atlas-backup
        
        if [ $? -eq 0 ]; then
            echo "✅ Local data exported to ~/f1app-atlas-backup"
            echo ""
            read -p "Enter your Atlas connection URI: " ATLAS_URI
            
            echo ""
            echo "📥 Importing to MongoDB Atlas..."
            mongorestore --uri="$ATLAS_URI" ~/f1app-atlas-backup/f1app
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Data successfully migrated to Atlas!"
                echo "🗑️  You can delete the backup: rm -rf ~/f1app-atlas-backup"
            else
                echo ""
                echo "❌ Import failed. Check your Atlas URI and network access settings."
            fi
        else
            echo "❌ Export failed. Is local MongoDB running?"
        fi
        ;;
    3)
        echo ""
        echo "🧪 Testing Atlas connection..."
        node -e "
        import('mongoose').then(mongoose => {
          require('dotenv').config();
          mongoose.connect(process.env.MONGO_URI)
            .then(() => {
              console.log('✅ Successfully connected to MongoDB Atlas!');
              process.exit(0);
            })
            .catch(err => {
              console.error('❌ Connection failed:', err.message);
              process.exit(1);
            });
        });
        "
        ;;
    4)
        echo "Cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done!"
echo ""
echo "💡 Next steps:"
echo "   1. Start backend: node server.js"
echo "   2. Check health: curl http://localhost:5002/api/health"
echo "   3. Deploy to cloud platform (Heroku, Railway, Render, etc.)"
echo ""
