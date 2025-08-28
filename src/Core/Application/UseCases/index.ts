/**
 * @fileoverview Application use cases index
 * 
 * Re-exports all use cases with PascalCase naming convention.
 * Also maintains backward compatibility with lowercase exports.
 */

// PascalCase exports (primary)
export { CreateItinerary } from './CreateItinerary.usecase';
export { GetItinerary } from './GetItinerary.usecase';
export { GetPublicPlans } from './GetPublicPlans.usecase';
export { ListTrips } from './ListTrips.usecase';
export { AddTrip } from './AddTrip.usecase';
export { DeleteTrip } from './DeleteTrip.usecase';

// Lowercase exports (backward compatibility)
export { createItinerary } from './CreateItinerary.usecase';
export { getItinerary } from './GetItinerary.usecase';
export { getPublicPlans } from './GetPublicPlans.usecase';
export { listTrips } from './ListTrips.usecase';
export { addTrip } from './AddTrip.usecase';
export { deleteTrip } from './DeleteTrip.usecase';