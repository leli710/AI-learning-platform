import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User';

const seedAdmin = async () => {
    const mongoUri = process.env.MONGO_URI as string;
    const adminEmail = process.env.ADMIN_EMAIL as string;
    const adminPassword = process.env.ADMIN_PASSWORD as string;

    if (!mongoUri || !adminEmail || !adminPassword) {
        console.error('Missing MONGO_URI, ADMIN_EMAIL or ADMIN_PASSWORD in .env');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
        if (!existing.isAdmin) {
            existing.isAdmin = true;
            await existing.save();
            console.log(`User ${adminEmail} promoted to admin.`);
        } else {
            console.log(`Admin user ${adminEmail} already exists.`);
        }
        await mongoose.disconnect();
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
        name: 'Admin',
        phone: '0500000000',
        identityNumber: '000000000',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        history: []
    });

    console.log(`Admin user created: ${adminEmail}`);
    await mongoose.disconnect();
};

seedAdmin().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
