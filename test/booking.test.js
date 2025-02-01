const request = require('supertest');
const app = require('../src/app'); // Path to your Express app

describe('POST /booking/slot/v1', () => {
  it('should allow a user to book a slot if it has less than 5 bookings', async () => {
    const response = await request(app)
      .post('/booking/slot/v1')
      .set('apps_name', 'web')
      .set('token', 'valid-user-token') // Replace with a valid user token
      .set('refresh_token', 'valid-refresh-token')
      .send({
        expert_identifier: 'shakshi.thakur@srkay.com',
        slot_id: 'valid-slot-id',
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Booking successful');
  });

  it('should not allow a user to book a slot if it has 5 approved bookings', async () => {
    const response = await request(app)
      .post('/booking/slot/v1')
      .set('apps_name', 'web')
      .set('token', 'valid-user-token')
      .set('refresh_token', 'valid-refresh-token')
      .send({
        expert_identifier: 'shakshi.thakur@srkay.com',
        slot_id: 'full-slot-id', // Replace with a slot that already has 5 bookings
      });
    expect(response.status).toBe(400); // Assuming the API returns 400 for a full slot
    expect(response.body.message).toBe('Slot is fully booked');
  });
});

describe('GET /booking/list/v1', () => {
    it('should return a list of booked slots for the authenticated user', async () => {
      const response = await request(app)
        .get('/booking/list/v1')
        .set('apps_name', 'web')
        .set('token', 'valid-user-token') // Use a valid user token
        .set('refresh_token', 'valid-refresh-token');
      expect(response.status).toBe(200);
      expect(response.body.bookings).toBeInstanceOf(Array);
      expect(response.body.bookings.length).toBeGreaterThan(0); // Assuming user has bookings
    });
  
    it('should not allow a user to view bookings of another user', async () => {
      const response = await request(app)
        .get('/booking/list/v1')
        .set('apps_name', 'web')
        .set('token', 'another-user-token') // Token of a different user
        .set('refresh_token', 'another-refresh-token');
      expect(response.status).toBe(403); // Forbidden for viewing another user's bookings
      expect(response.body.message).toBe('You are not authorized to view this booking list');
    });
  });
  