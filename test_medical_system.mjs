import assert from 'node:assert/strict';
import {
  DOCTOR_PLANS,
  rescueInjured,
  assignBedsFIFO,
  recoverInShelter,
  getDoctorRenewalDecision
} from './src/utils/medicalSystem.js';

assert.deepEqual(DOCTOR_PLANS.map(p => [p.days, p.usdt, p.mnc]), [
  [30, 5.20, 520], [90, 13.80, 1380], [180, 25.00, 2500]
]);

const squad = [
  { id: 'a', status: 'work', currentHealth: 5, maxHealth: 100 },
  { id: 'b', status: 'work', currentHealth: 4, maxHealth: 100 },
  { id: 'c', status: 'work', currentHealth: 80, maxHealth: 100 }
];
const manual = rescueInjured(squad, { survivorId: 'a', capacity: 1 });
assert.equal(manual.find(s => s.id === 'a').status, 'house');
assert.equal(manual.find(s => s.id === 'b').status, 'work');
assert.equal(manual.find(s => s.id === 'c').status, 'work');

const automatic = rescueInjured(squad, { doctorActive: true, capacity: 1 });
assert.equal(automatic.find(s => s.id === 'a').status, 'house');
assert.equal(automatic.find(s => s.id === 'b').status, 'waiting_house');
assert.equal(automatic.find(s => s.id === 'c').status, 'work');

const queued = assignBedsFIFO([
  { id: 'first', status: 'waiting_house', rescueRequestedAt: 10 },
  { id: 'second', status: 'waiting_house', rescueRequestedAt: 20 }
], 1);
assert.equal(queued.find(s => s.id === 'first').status, 'house');
assert.equal(queued.find(s => s.id === 'second').status, 'waiting_house');

const healed = recoverInShelter([{ id: 'x', status: 'house', currentHealth: 50, maxHealth: 100 }], 120 * 60000, 100, 240);
assert.equal(healed[0].currentHealth, 100);
assert.equal(healed[0].status, 'reserve');

assert.equal(getDoctorRenewalDecision({ expiresAt: 0, now: 100, autoRenew: true, currency: 'USDT', mncBalance: 9999, planMnc: 520 }).reason, 'auto_renew_requires_mnc');
assert.equal(getDoctorRenewalDecision({ expiresAt: 0, now: 100, autoRenew: true, currency: 'MNC', mncBalance: 519, planMnc: 520 }).reason, 'insufficient_mnc');
assert.equal(getDoctorRenewalDecision({ expiresAt: 0, now: 100, autoRenew: true, currency: 'MNC', mncBalance: 520, planMnc: 520 }).renew, true);

console.log('medicalSystem: all tests passed');
