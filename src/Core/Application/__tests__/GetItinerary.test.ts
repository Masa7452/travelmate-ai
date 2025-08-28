import { describe, it, expect, vi } from 'vitest';
import { getItinerary } from '../UseCases/GetItinerary.usecase';
import { NotFoundError } from '@/Shared/ErrorMapping';
import type { Repositories } from '@core/Infrastructure/Provider/repository';
import type { Itinerary } from '@/Shared/Contracts';

describe('GetItinerary', () => {
  it('should_return_itinerary_when_found', async () => {
    // Arrange
    const mockItinerary: Itinerary = {
      id: 'itinerary_123',
      createdAt: '2024-01-01T00:00:00Z',
      title: 'Found Trip',
      sourceQuery: 'query',
      days: [{
        date: '2024-01-01',
        segments: [{ type: 'poi', name: 'Place' }],
      }],
    };

    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockItinerary),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await getItinerary(mockRepos, 'itinerary_123');

    // Assert
    expect(result).toEqual(mockItinerary);
    expect(mockRepos.itineraries.findById).toHaveBeenCalledWith('itinerary_123');
  });

  it('should_throw_NotFoundError_when_itinerary_not_found', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn().mockResolvedValue(undefined),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act & Assert
    await expect(
      getItinerary(mockRepos, 'non_existent')
    ).rejects.toThrow(NotFoundError);
    
    await expect(
      getItinerary(mockRepos, 'non_existent')
    ).rejects.toThrow('Itinerary non_existent not found');
  });
});