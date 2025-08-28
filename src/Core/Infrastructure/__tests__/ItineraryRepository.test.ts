import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryItineraryRepository } from '../Repositories/Itinerary/repository';
import type { Itinerary } from '@/Shared/Contracts';

describe('InMemoryItineraryRepository', () => {
  let repository: InMemoryItineraryRepository;
  
  const sampleItinerary: Itinerary = {
    id: 'test_123',
    createdAt: '2024-01-01T00:00:00Z',
    title: 'Test Trip',
    sourceQuery: 'test query',
    days: [{
      date: '2024-01-01',
      segments: [{ type: 'poi', name: 'Place' }],
    }],
  };

  beforeEach(() => {
    repository = new InMemoryItineraryRepository();
  });

  it('should_save_and_retrieve_itinerary', async () => {
    // Act
    await repository.save(sampleItinerary);
    const retrieved = await repository.findById('test_123');

    // Assert
    expect(retrieved).toEqual(sampleItinerary);
  });

  it('should_return_undefined_for_non_existent_id', async () => {
    // Act
    const result = await repository.findById('non_existent');

    // Assert
    expect(result).toBeUndefined();
  });

  it('should_store_deep_copy_preventing_mutation', async () => {
    // Arrange
    const mutable = { ...sampleItinerary };
    
    // Act
    await repository.save(mutable);
    mutable.title = 'Modified Title';
    const retrieved = await repository.findById('test_123');

    // Assert
    expect(retrieved?.title).toBe('Test Trip');
  });

  it('should_return_deep_copy_on_retrieval', async () => {
    // Arrange
    await repository.save(sampleItinerary);
    
    // Act
    const retrieved1 = await repository.findById('test_123');
    const retrieved2 = await repository.findById('test_123');

    // Assert
    expect(retrieved1).toEqual(retrieved2);
    expect(retrieved1).not.toBe(retrieved2);
    
    // Verify mutation doesn't affect store
    if (retrieved1) {
      retrieved1.title = 'Modified';
      const retrieved3 = await repository.findById('test_123');
      expect(retrieved3?.title).toBe('Test Trip');
    }
  });

  it('should_overwrite_existing_itinerary', async () => {
    // Arrange
    await repository.save(sampleItinerary);
    const updated = { ...sampleItinerary, title: 'Updated Trip' };
    
    // Act
    await repository.save(updated);
    const retrieved = await repository.findById('test_123');

    // Assert
    expect(retrieved?.title).toBe('Updated Trip');
  });
});