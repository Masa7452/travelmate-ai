import { describe, it, expect, vi } from 'vitest';
import { deleteTrip } from '../UseCases/DeleteTrip.usecase';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

describe('DeleteTrip', () => {
  it('should_delete_trip_and_return_true_when_successful', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn().mockResolvedValue(true),
      },
    } as any;

    // Act
    const result = await deleteTrip(mockRepos, 'trip_123');

    // Assert
    expect(result).toBe(true);
    expect(mockRepos.trips.delete).toHaveBeenCalledWith('trip_123');
  });

  it('should_return_false_when_trip_not_found', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn().mockResolvedValue(false),
      },
    } as any;

    // Act
    const result = await deleteTrip(mockRepos, 'non_existent');

    // Assert
    expect(result).toBe(false);
    expect(mockRepos.trips.delete).toHaveBeenCalledWith('non_existent');
  });
});