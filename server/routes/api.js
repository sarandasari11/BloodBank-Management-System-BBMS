const express = require('express');
const router = express.Router();

const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const Hospital = require('../models/Hospital');
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');

// 🔌 Database Seeder
router.post('/seed', async (req, res) => {
  try {
    // Clear all existing data
    await Donor.deleteMany({});
    await Donation.deleteMany({});
    await Hospital.deleteMany({});
    await BloodRequest.deleteMany({});
    await Inventory.deleteMany({});

    // 1. Seed Inventory
    const initialInventory = [
      { bloodGroup: 'A+', unitsAvailable: 15 },
      { bloodGroup: 'A-', unitsAvailable: 8 },
      { bloodGroup: 'B+', unitsAvailable: 22 },
      { bloodGroup: 'B-', unitsAvailable: 6 },
      { bloodGroup: 'AB+', unitsAvailable: 12 },
      { bloodGroup: 'AB-', unitsAvailable: 3 },
      { bloodGroup: 'O+', unitsAvailable: 28 },
      { bloodGroup: 'O-', unitsAvailable: 10 }
    ];
    await Inventory.insertMany(initialInventory);

    // 2. Seed Donors
    const dateWeeksAgo = (weeks) => {
      const d = new Date();
      d.setDate(d.getDate() - (weeks * 7));
      return d;
    };

    const donorsData = [
      { name: 'John Doe', age: 32, gender: 'Male', bloodGroup: 'A+', phone: '123-456-7890', address: '123 Elm St', lastDonation: dateWeeksAgo(12) },
      { name: 'Jane Smith', age: 28, gender: 'Female', bloodGroup: 'O-', phone: '987-654-3210', address: '456 Oak St', lastDonation: dateWeeksAgo(4) },
      { name: 'Robert Johnson', age: 45, gender: 'Male', bloodGroup: 'B+', phone: '555-0199', address: '789 Pine St', lastDonation: null },
      { name: 'Alice Williams', age: 36, gender: 'Female', bloodGroup: 'AB+', phone: '555-0144', address: '101 Cedar Ln', lastDonation: dateWeeksAgo(8) },
      { name: 'Michael Brown', age: 50, gender: 'Male', bloodGroup: 'O+', phone: '555-0177', address: '202 Maple Dr', lastDonation: dateWeeksAgo(1) },
      { name: 'Emily Davis', age: 24, gender: 'Female', bloodGroup: 'A-', phone: '555-0111', address: '303 Birch Rd', lastDonation: null },
      { name: 'William Wilson', age: 41, gender: 'Male', bloodGroup: 'B-', phone: '555-0122', address: '404 Walnut Ave', lastDonation: dateWeeksAgo(6) },
      { name: 'Olivia Martinez', age: 29, gender: 'Female', bloodGroup: 'AB-', phone: '555-0133', address: '505 Cherry Ct', lastDonation: null },
      { name: 'David Anderson', age: 33, gender: 'Male', bloodGroup: 'O+', phone: '555-0155', address: '606 Ash Way', lastDonation: dateWeeksAgo(2) },
      { name: 'Sophia Taylor', age: 31, gender: 'Female', bloodGroup: 'A+', phone: '555-0166', address: '707 Redwood Blvd', lastDonation: dateWeeksAgo(16) }
    ];
    const seededDonors = await Donor.insertMany(donorsData);

    // 3. Seed Hospitals
    const hospitalsData = [
      { hospitalName: 'City General Hospital', contactPerson: 'Dr. Sarah Connor', phone: '111-222-3333', address: '100 Medical Plaza' },
      { hospitalName: 'St. Jude Research Hospital', contactPerson: 'Dr. Marcus Aurelius', phone: '444-555-6666', address: '200 Hope Way' },
      { hospitalName: 'Grace Valley Clinic', contactPerson: 'Nurse Jackie', phone: '777-888-9999', address: '300 Peace Dr' },
      { hospitalName: 'Metropolitan Trauma Center', contactPerson: 'Dr. Gregory House', phone: '555-9111', address: '400 Healing Blvd' },
      { hospitalName: 'Sacred Heart Hospital', contactPerson: 'Dr. John Dorian', phone: '555-2468', address: '500 Mercy Ave' },
      { hospitalName: 'Mercy Childrens Clinic', contactPerson: 'Dr. Arizona Robbins', phone: '555-7362', address: '600 Rainbow Lane' }
    ];
    const seededHospitals = await Hospital.insertMany(hospitalsData);

    // 4. Seed Past Donations
    const donationsData = [
      { donorId: seededDonors[0]._id, bloodGroup: 'A+', unitsDonated: 2, donationDate: dateWeeksAgo(12) },
      { donorId: seededDonors[1]._id, bloodGroup: 'O-', unitsDonated: 1, donationDate: dateWeeksAgo(4) },
      { donorId: seededDonors[3]._id, bloodGroup: 'AB+', unitsDonated: 3, donationDate: dateWeeksAgo(8) },
      { donorId: seededDonors[4]._id, bloodGroup: 'O+', unitsDonated: 2, donationDate: dateWeeksAgo(1) },
      { donorId: seededDonors[6]._id, bloodGroup: 'B-', unitsDonated: 1, donationDate: dateWeeksAgo(6) },
      { donorId: seededDonors[8]._id, bloodGroup: 'O+', unitsDonated: 3, donationDate: dateWeeksAgo(2) },
      { donorId: seededDonors[9]._id, bloodGroup: 'A+', unitsDonated: 2, donationDate: dateWeeksAgo(16) }
    ];
    await Donation.insertMany(donationsData);

    // 5. Seed Blood Requests
    const requestsData = [
      { hospitalId: seededHospitals[0]._id, bloodGroup: 'B+', unitsRequired: 4, requestDate: dateWeeksAgo(2), status: 'Pending' },
      { hospitalId: seededHospitals[1]._id, bloodGroup: 'A+', unitsRequired: 2, requestDate: dateWeeksAgo(5), status: 'Approved' },
      { hospitalId: seededHospitals[2]._id, bloodGroup: 'O-', unitsRequired: 3, requestDate: dateWeeksAgo(1), status: 'Pending' },
      { hospitalId: seededHospitals[3]._id, bloodGroup: 'AB-', unitsRequired: 1, requestDate: dateWeeksAgo(3), status: 'Approved' },
      { hospitalId: seededHospitals[4]._id, bloodGroup: 'O+', unitsRequired: 5, requestDate: dateWeeksAgo(4), status: 'Rejected' },
      { hospitalId: seededHospitals[5]._id, bloodGroup: 'A-', unitsRequired: 2, requestDate: dateWeeksAgo(2), status: 'Pending' },
      { hospitalId: seededHospitals[0]._id, bloodGroup: 'B-', unitsRequired: 3, requestDate: dateWeeksAgo(7), status: 'Approved' },
      { hospitalId: seededHospitals[1]._id, bloodGroup: 'AB+', unitsRequired: 4, requestDate: dateWeeksAgo(6), status: 'Rejected' }
    ];
    await BloodRequest.insertMany(requestsData);

    res.json({ message: 'Database seeded successfully with rich, diverse relational mock data!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Stats/Overview Aggregations
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });

    // Find any blood groups below safety threshold (e.g. < 6 units)
    const lowStockAlerts = await Inventory.find({ unitsAvailable: { $lt: 6 } });

    res.json({
      totalDonors,
      totalDonations,
      totalHospitals,
      pendingRequests,
      lowStockAlertsCount: lowStockAlerts.length,
      lowStockAlerts: lowStockAlerts.map(i => i.bloodGroup)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🩸 Inventory Endpoints
router.get('/inventory', async (req, res) => {
  try {
    const stock = await Inventory.find().sort({ bloodGroup: 1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/inventory/manual', async (req, res) => {
  const { bloodGroup, unitsAvailable } = req.body;
  try {
    const item = await Inventory.findOneAndUpdate(
      { bloodGroup },
      { unitsAvailable: parseInt(unitsAvailable) },
      { new: true, upsert: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧑 Donors Endpoints
router.get('/donors', async (req, res) => {
  try {
    const donors = await Donor.find().sort({ name: 1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donors', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/donors/:id', async (req, res) => {
  try {
    const updated = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/donors/:id', async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏥 Hospital Endpoints
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ hospitalName: 1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hospitals', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hospitals/:id', async (req, res) => {
  try {
    const updated = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hospitals/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💉 Donation Endpoints (Transactions)
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId')
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donations', async (req, res) => {
  const { donorId, unitsDonated, donationDate } = req.body;
  try {
    // 1. Verify donor exists
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found.' });
    }

    // 2. Create the donation record
    const donation = new Donation({
      donorId,
      bloodGroup: donor.bloodGroup,
      unitsDonated: parseInt(unitsDonated),
      donationDate: donationDate || new Date()
    });
    await donation.save();

    // 3. Increment inventory for this blood group
    await Inventory.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { unitsAvailable: parseInt(unitsDonated) } },
      { new: true, upsert: true }
    );

    // 4. Update the donor's last donation date
    donor.lastDonation = donationDate || new Date();
    await donor.save();

    res.json({ message: 'Donation recorded and inventory incremented successfully!', donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Request Endpoints (Transactions)
router.get('/requests', async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospitalId')
      .sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/requests', async (req, res) => {
  const { hospitalId, bloodGroup, unitsRequired, requestDate } = req.body;
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found.' });
    }

    const newRequest = new BloodRequest({
      hospitalId,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      requestDate: requestDate || new Date(),
      status: 'Pending'
    });
    await newRequest.save();

    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/requests/:id', async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected' or 'Pending'
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found.' });
    }

    // Business Logic: If approving a request that was NOT already approved
    if (status === 'Approved' && request.status !== 'Approved') {
      // Check inventory
      const inv = await Inventory.findOne({ bloodGroup: request.bloodGroup });
      if (!inv || inv.unitsAvailable < request.unitsRequired) {
        return res.status(400).json({ 
          error: `Insufficient inventory for ${request.bloodGroup}. Available: ${inv ? inv.unitsAvailable : 0} units, Required: ${request.unitsRequired} units.` 
        });
      }

      // Decrement inventory
      inv.unitsAvailable -= request.unitsRequired;
      await inv.save();
    } 
    // Business Logic: If reverting an already Approved request back to Pending/Rejected
    else if (status !== 'Approved' && request.status === 'Approved') {
      // Refund the units to inventory
      await Inventory.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: request.unitsRequired } }
      );
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request status updated to ${status}.`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (request && request.status === 'Approved') {
      // Refund inventory units on delete of approved request
      await Inventory.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: request.unitsRequired } }
      );
    }
    await BloodRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted and inventory adjusted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
