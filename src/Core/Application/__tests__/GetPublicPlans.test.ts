import { describe, it, expect, vi } from 'vitest';
import { getPublicPlans } from '../UseCases/GetPublicPlans.usecase';
import type { Repositories } from '@core/Infrastructure/Provider/repository';
import type { PublicPlanCard } from '@/Shared/Contracts';

describe('GetPublicPlans', () => {
  it('should_return_public_plan_cards_from_repository', async () => {
    // Arrange
    const mockCards: PublicPlanCard[] = [
      {
        id: 'public_1',
        title: 'Tokyo Adventure',
        thumbnail: '/tokyo.jpg',
        duration: '3 days',
        highlights: ['Shibuya', 'Asakusa'],
      },
      {
        id: 'public_2',
        title: 'Kyoto Trip',
      },
    ];

    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn().mockResolvedValue(mockCards),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await getPublicPlans(mockRepos);

    // Assert
    expect(result).toEqual(mockCards);
    expect(mockRepos.itineraries.findPublic).toHaveBeenCalled();
  });

  it('should_return_empty_array_when_no_public_plans', async () => {
    // Arrange
    const mockRepos: Repositories = {
      itineraries: {
        save: vi.fn(),
        findById: vi.fn(),
        findPublic: vi.fn().mockResolvedValue([]),
      },
      trips: {
        save: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    // Act
    const result = await getPublicPlans(mockRepos);

    // Assert
    expect(result).toEqual([]);
  });
});