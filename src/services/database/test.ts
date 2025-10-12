/**
 * Simple test file for database services
 * Run this to verify services work correctly
 */
import { reviewsService, usersService } from './index';

export async function testDatabaseServices() {
  console.log('🧪 Testing Database Services...\n');

  try {
    // Test 1: List reviews
    console.log('Test 1: List reviews...');
    const reviews = await reviewsService.list({ limit: 5 });
    console.log(`✅ Found ${reviews.count} total reviews`);
    console.log(`✅ Retrieved ${reviews.data.length} reviews`);

    // Test 2: Get a single review (if any exist)
    if (reviews.data.length > 0) {
      console.log('\nTest 2: Get single review...');
      const review = await reviewsService.getById(reviews.data[0].id);
      console.log(`✅ Retrieved review: ${review.id}`);
    }

    // Test 3: Search reviews
    console.log('\nTest 3: Search reviews...');
    const searchResults = await reviewsService.search('test', { limit: 5 });
    console.log(`✅ Search found ${searchResults.length} results`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Uncomment to run tests:
// testDatabaseServices();
