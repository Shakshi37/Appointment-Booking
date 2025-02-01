const request = require('supertest');
const app = require('../src/app'); // Path to your Express app

describe('POST /slot/upsert/slot/v1', () => {
    it('should allow an expert to create a slot', async () => {
        const response = await request(app)
            .post('/slot/upsert/slot/v1')
            .set('token', 'valid-expert-token') // Use a valid expert token
            .set('refresh_token', 'valid-refresh-token') // Use valid refresh token
            .set('apps_name', 'web')
            .send({
                identifier: 'shakshi.thakur@srkay.com',
                timeRange: {
                    startDate: '2025-02-02',
                    endDate: '2025-02-10',
                    startTime: '10:00:00 AM',
                    endTime: '01:00:00 PM',
                },
                days: ['Monday', 'Wednesday'],
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Slot created successfully');
        expect(response.body.slot).toHaveProperty('identifier', 'shakshi.thakur@srkay.com');
        expect(response.body.slot.timeRange).toHaveProperty('startDate', '2025-02-02');
        expect(response.body.slot.timeRange).toHaveProperty('endDate', '2025-02-10');
    });

    it('should return an error if required fields are missing', async () => {
        const response = await request(app)
            .post('/slot/upsert/slot/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                identifier: 'shakshi.thakur@srkay.com',
                timeRange: {
                    startDate: '2025-02-02',
                    endDate: '2025-02-10',
                },
                days: ['Monday'],
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid slot data');
    });
});

describe('POST /slot/get/slot/v1', () => {
    it('should return the list of slots for the expert', async () => {
        const response = await request(app)
            .post('/slot/get/slot/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                identifier: 'shakshi.thakur@srkay.com',
            });

        expect(response.status).toBe(200);
        expect(response.body.slots).toBeInstanceOf(Array);
        expect(response.body.slots.length).toBeGreaterThan(0);
    });

    it('should return an error if the expert does not have any slots', async () => {
        const response = await request(app)
            .post('/slot/get/slot/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                identifier: 'shakshi.thakur@srkay.com',
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('No slots found for this expert');
    });
});


describe('POST /booking/update/status/v1', () => {
    it('should allow an expert to approve a booking', async () => {
        const response = await request(app)
            .post('/booking/update/status/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                slotId: 'valid-slot-id',
                bookingId: 'valid-booking-id',
                status: 'approved',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Booking status updated to approved');
    });

    it('should not allow an expert to approve more than 5 bookings for a slot', async () => {
        const response = await request(app)
            .post('/booking/update/status/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                slotId: 'full-slot-id', // This slot is already fully booked
                bookingId: 'new-booking-id',
                status: 'approved',
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Cannot approve more than 5 bookings for this slot');
    });

    it('should return an error if the status is invalid', async () => {
        const response = await request(app)
            .post('/booking/update/status/v1')
            .set('token', 'valid-expert-token')
            .set('refresh_token', 'valid-refresh-token')
            .set('apps_name', 'web')
            .send({
                slotId: 'valid-slot-id',
                bookingId: 'valid-booking-id',
                status: 'invalid-status', // Invalid status
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid status');
    });
});

