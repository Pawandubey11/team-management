require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./database');

const Company = require('../models/Company');
const Department = require('../models/Department');
const User = require('../models/User');
const Group = require('../models/Group');

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    await Company.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create company
    const company = await Company.create({
      name: 'Nexus Corp',
      description: 'A cutting-edge technology company'
    });

    // Create departments
    const deptNames = ['Frontend', 'Backend', 'Sales', 'Production', 'HR'];
    const departments = [];
    for (const name of deptNames) {
      const dept = await Department.create({
        name,
        description: `${name} department`,
        companyId: company._id
      });
      departments.push(dept);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'System Admin',
      email: 'admin@nexuscorp.com',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company._id
    });

    // Create employees for each department
    const employeeData = [
      { name: 'Alice Chen', email: 'alice@nexuscorp.com', dept: 'Frontend' },
      { name: 'Bob Smith', email: 'bob@nexuscorp.com', dept: 'Frontend' },
      { name: 'Carol Davis', email: 'carol@nexuscorp.com', dept: 'Backend' },
      { name: 'David Lee', email: 'david@nexuscorp.com', dept: 'Backend' },
      { name: 'Eva Martinez', email: 'eva@nexuscorp.com', dept: 'Sales' },
      { name: 'Frank Johnson', email: 'frank@nexuscorp.com', dept: 'Production' },
      { name: 'Grace Kim', email: 'grace@nexuscorp.com', dept: 'HR' }
    ];

    const empPassword = await bcrypt.hash('emp123', 12);
    for (const emp of employeeData) {
      const dept = departments.find(d => d.name === emp.dept);
      await User.create({
        name: emp.name,
        email: emp.email,
        password: empPassword,
        role: 'EMPLOYEE',
        companyId: company._id,
        departmentId: dept._id
      });
    }

    // Create department chat groups
    for (const dept of departments) {
      await Group.create({
        name: `${dept.name} Team`,
        description: `Official chat group for ${dept.name} department`,
        companyId: company._id,
        departmentId: dept._id
      });
    }

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@nexuscorp.com / admin123');
    console.log('Employee (Frontend): alice@nexuscorp.com / emp123');
    console.log('Employee (Backend): carol@nexuscorp.com / emp123');
    console.log('Employee (Sales): eva@nexuscorp.com / emp123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
