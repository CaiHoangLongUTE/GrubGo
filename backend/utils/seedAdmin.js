import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || "Admin";
        const adminMobile = process.env.ADMIN_MOBILE || "0000000000";

        // Kiểm tra xem có config admin trong env không
        if (!adminEmail || !adminPassword) {
            console.log('ℹ️  No admin credentials in .env file');
            return;
        }

        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // Nếu tồn tại nhưng không phải admin, update role
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.status = 'active';
                await existingAdmin.save();
                console.log(`✅ Updated ${adminEmail} to admin role`);
            } else {
                console.log(`ℹ️  Admin account already exists: ${adminEmail}`);
            }
            return;
        }

        // Tạo admin mới
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = new User({
            fullName: adminName,
            email: adminEmail,
            password: hashedPassword,
            mobile: adminMobile,
            role: 'admin',
            status: 'active',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        });

        await admin.save();
        console.log(`✅ Admin account created successfully: ${adminEmail}`);

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};
