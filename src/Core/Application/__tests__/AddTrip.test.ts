import { describe, it, expect, vi } from 'vitest';
import { addTrip } from '../UseCases/AddTrip.usecase';
import type { Repositories } from '@core/Infrastructure/Provider/repository';
import type { MyTripCard } from '@/Shared/Contracts';

describe('AddTrip', () => {
  it('should_add_trip_and_return_trip_card', async () => {
    // Arrange
    const mockNow = () => new Date('2024-01-15T12:00:00Z');
    
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn().mockResolvedValue(undefined),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await addTrip(
      mockRepos,
      { id: 'trip_123', title: 'New Trip' },
      mockNow
    );

    // Assert
    const expectedTrip: MyTripCard = {
      id: 'trip_123',
      title: 'New Trip',
      createdAt: '2024-01-15T12:00:00.000Z',
    };
    
    expect(result).toEqual(expectedTrip);
    expect(mockRepos.trips.save).toHaveBeenCalledWith(expectedTrip);
  });

  it('should_use_current_time_when_now_not_provided', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn().mockResolvedValue(undefined),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await addTrip(
      mockRepos,
      { id: 'trip_456', title: 'Another Trip' }
    );

    // Assert
    expect(result.id).toBe('trip_456');
    expect(result.title).toBe('Another Trip');
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(mockRepos.trips.save).toHaveBeenCalled();
  });
});