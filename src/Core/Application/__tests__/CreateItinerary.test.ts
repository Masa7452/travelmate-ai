import { describe, it, expect, vi } from 'vitest';
import { createItinerary } from '../UseCases/CreateItinerary.usecase';
import type { Repositories } from '@core/Infrastructure/Provider/repository';
import type { Itinerary } from '@/Shared/Contracts';

describe('CreateItinerary', () => {
  it('should_create_itinerary_and_return_id', async () => {
    // Arrange
    const mockItinerary: Itinerary = {
      id: 'itinerary_abc123',
      createdAt: '2024-01-01T00:00:00Z',
      title: 'Test Trip',
      sourceQuery: 'test query',
      days: [{
        date: '2024-01-01',
        segments: [{ type: 'poi', name: 'Place' }],
      }],
    };

    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn().mockResolvedValue(undefined),
        findById: vi.fn(),
        findPublic: vi.fn(),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    const mockPlanner = vi.fn().mockResolvedValue(mockItinerary);
    const mockIdFactory = () => 'itinerary_abc123';

    // Act
    const result = await createItinerary(
      mockRepos,
      { query: 'test query' },
      mockPlanner,
      mockIdFactory
    );

    // Assert
    expect(result).toEqual({ id: 'itinerary_abc123' });
    expect(mockPlanner).toHaveBeenCalledWith('test query');
    expect(mockRepos.itineraries.save).toHaveBeenCalledWith(mockItinerary);
  });

  it('should_propagate_planner_errors', async () => {
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
        delete: vi.fn(),
      },
    } as any;

    const mockPlanner = vi.fn().mockRejectedValue(new Error('Planner failed'));
    const mockIdFactory = () => 'test_id';

    // Act & Assert
    await expect(
      createItinerary(mockRepos, { query: 'test' }, mockPlanner, mockIdFactory)
    ).rejects.toThrow('Planner failed');
  });
});