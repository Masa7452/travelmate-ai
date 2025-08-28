import { describe, it, expect, vi } from 'vitest';
import { listTrips } from '../UseCases/ListTrips.usecase';
import type { Repositories } from '@core/Infrastructure/Provider/repository';
import type { MyTripCard } from '@/Shared/Contracts';

describe('ListTrips', () => {
  it('should_return_trips_from_repository', async () => {
    // Arrange
    const mockTrips: MyTripCard[] = [
      {
        id: 'trip_1',
        title: 'My Trip 1',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'trip_2',
        title: 'My Trip 2',
        createdAt: '2024-01-02T00:00:00Z',
        thumbnail: '/image.jpg',
      },
    ];

    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn().mockResolvedValue(mockTrips),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await listTrips(mockRepos);

    // Assert
    expect(result).toEqual(mockTrips);
    expect(mockRepos.trips.list).toHaveBeenCalled();
  });

  it('should_return_empty_array_when_no_trips', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await listTrips(mockRepos);

    // Assert
    expect(result).toEqual([]);
  });
});