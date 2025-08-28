import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTripsRepository } from '../Repositories/Trips/repository';
import type { MyTripCard } from '@/Shared/Contracts';

describe('InMemoryTripsRepository', () => {
  let repository: InMemoryTripsRepository;
  
  const sampleTrip1: MyTripCard = {
    id: 'trip_1',
    title: 'Trip One',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const sampleTrip2: MyTripCard = {
    id: 'trip_2',
    title: 'Trip Two',
    createdAt: '2024-01-02T00:00:00Z',
    thumbnail: '/image.jpg',
  };

  beforeEach(() => {
    repository = new InMemoryTripsRepository();
  });

  it('should_start_with_empty_list', async () => {
    // Act
    const trips = await repository.list();

    // Assert
    expect(trips).toEqual([]);
  });

  it('should_add_and_list_trips', async () => {
    // Act
    await repository.add(sampleTrip1);
    await repository.add(sampleTrip2);
    const trips = await repository.list();

    // Assert
    expect(trips).toHaveLength(2);
    expect(trips).toContainEqual(sampleTrip1);
    expect(trips).toContainEqual(sampleTrip2);
  });

  it('should_store_deep_copy_preventing_mutation', async () => {
    // Arrange
    const mutable = { ...sampleTrip1 };
    
    // Act
    await repository.add(mutable);
    mutable.title = 'Modified Title';
    const trips = await repository.list();

    // Assert
    expect(trips[0].title).toBe('Trip One');
  });

  it('should_return_deep_copy_on_list', async () => {
    // Arrange
    await repository.add(sampleTrip1);
    
    // Act
    const list1 = await repository.list();
    const list2 = await repository.list();

    // Assert
    expect(list1).toEqual(list2);
    expect(list1).not.toBe(list2);
    expect(list1[0]).not.toBe(list2[0]);
    
    // Verify mutation doesn't affect store
    list1[0].title = 'Modified';
    const list3 = await repository.list();
    expect(list3[0].title).toBe('Trip One');
  });

  it('should_remove_trip_by_id', async () => {
    // Arrange
    await repository.add(sampleTrip1);
    await repository.add(sampleTrip2);
    
    // Act
    const removed = await repository.remove('trip_1');
    const trips = await repository.list();

    // Assert
    expect(removed).toBe(true);
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe('trip_2');
  });

  it('should_return_false_when_removing_non_existent_trip', async () => {
    // Act
    const removed = await repository.remove('non_existent');

    // Assert
    expect(removed).toBe(false);
  });

  it('should_overwrite_trip_with_same_id', async () => {
    // Arrange
    await repository.add(sampleTrip1);
    const updated = { ...sampleTrip1, title: 'Updated Title' };
    
    // Act
    await repository.add(updated);
    const trips = await repository.list();

    // Assert
    expect(trips).toHaveLength(1);
    expect(trips[0].title).toBe('Updated Title');
  });
});