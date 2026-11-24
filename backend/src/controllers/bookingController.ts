import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { propertyName, status } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter: any = {};
      if (propertyName) filter.propertyName = propertyName;
      if (status) filter.status = status;
      const bookings = await Booking.find(filter).sort({ unitNumber: 1 });
      return res.json({ success: true, count: bookings.length, data: bookings, source: 'mongodb' });
    }

    let result = [...memStore.bookings];
    if (propertyName) result = result.filter((b) => b.propertyName === propertyName);
    if (status) result = result.filter((b) => b.status === status);

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { propertyName, unitNumber, price, propertyType } = req.body;
    if (!propertyName || !unitNumber || !price) {
      return res.status(400).json({ success: false, error: 'Property name, unit number, and price are required' });
    }

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const booking = await Booking.create(req.body);
      realtimeBus.broadcast({ type: 'BOOKING_CREATED', action: 'create', data: booking, message: `New unit registered: ${unitNumber}` });
      return res.status(201).json({ success: true, data: booking, source: 'mongodb' });
    }

    const newBooking: any = {
      _id: `book-${Date.now()}`,
      propertyName,
      unitNumber,
      propertyType: propertyType || 'Apartment',
      price: Number(price),
      areaSqFt: req.body.areaSqFt || 1200,
      floor: req.body.floor || 1,
      bedrooms: req.body.bedrooms || 2,
      bathrooms: req.body.bathrooms || 2,
      customerName: req.body.customerName || '',
      customerEmail: req.body.customerEmail || '',
      customerPhone: req.body.customerPhone || '',
      bookingDate: req.body.bookingDate || '',
      status: req.body.status || 'Available',
      features: req.body.features || ['Balcony View', 'Covered Parking'],
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    };

    memStore.bookings.unshift(newBooking);
    memStore.save();
    realtimeBus.broadcast({ type: 'BOOKING_CREATED', action: 'create', data: newBooking, message: `New unit added: ${newBooking.unitNumber} (${newBooking.propertyName})` });
    return res.status(201).json({ success: true, data: newBooking, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Booking not found' });
      realtimeBus.broadcast({ type: 'BOOKING_UPDATED', action: 'update', data: updated, message: `Unit status updated: ${updated.unitNumber} (${updated.status})` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.bookings.findIndex((b) => b._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Booking not found' });

    memStore.bookings[index] = { ...memStore.bookings[index], ...req.body };
    memStore.save();
    realtimeBus.broadcast({ type: 'BOOKING_UPDATED', action: 'update', data: memStore.bookings[index], message: `Unit ${memStore.bookings[index].unitNumber} updated (${memStore.bookings[index].status})` });
    return res.json({ success: true, data: memStore.bookings[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Booking.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Booking not found' });
      realtimeBus.broadcast({ type: 'BOOKING_DELETED', action: 'delete', data: { id }, message: 'Unit booking deleted' });
      return res.json({ success: true, message: 'Booking removed successfully', source: 'mongodb' });
    }

    const index = memStore.bookings.findIndex((b) => b._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Booking not found' });

    const removed = memStore.bookings.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'BOOKING_DELETED', action: 'delete', data: { id }, message: `Unit booking removed: ${removed.unitNumber}` });
    return res.json({ success: true, message: 'Booking removed successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
