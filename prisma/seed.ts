import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample problems (migrating from your JSON data)
  const problems = [
    {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY' as const,
      patterns: ['Hash Map', 'Two Pointers'],
      cues: ['complement search', 'lookup optimization', 'sorted array', 'opposite ends'],
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      isCustom: false
    },
    {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'EASY' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'variable window', 'contiguous elements'],
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      examples: [
        {
          input: 'prices = [7,1,5,3,6,4]',
          output: '5',
          explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
        }
      ],
      constraints: [
        '1 <= prices.length <= 10^5',
        '0 <= prices[i] <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: 'contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'EASY' as const,
      patterns: ['Hash Map', 'Sorting'],
      cues: ['frequency counting', 'duplicate detection', 'arrange elements', 'comparison-based'],
      description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
      examples: [
        {
          input: 'nums = [1,2,3,1]',
          output: 'true'
        },
        {
          input: 'nums = [1,2,3,4]',
          output: 'false'
        }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^9 <= nums[i] <= 10^9'
      ],
      isCustom: false
    },
    {
      slug: 'product-of-array-except-self',
      title: 'Product of Array Except Self',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Two Pointers'],
      cues: ['optimal substructure', 'overlapping subproblems', 'opposite ends', 'move pointers'],
      description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operator.',
      examples: [
        {
          input: 'nums = [1,2,3,4]',
          output: '[24,12,8,6]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^5',
        '-30 <= nums[i] <= 30',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'
      ],
      isCustom: false
    },
    {
      slug: 'maximum-subarray',
      title: 'Maximum Subarray',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'subarray', 'contiguous elements'],
      description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.',
      examples: [
        {
          input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
          output: '6',
          explanation: '[4,-1,2,1] has the largest sum = 6.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: 'maximum-product-subarray',
      title: 'Maximum Product Subarray',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'subarray', 'contiguous elements'],
      description: 'Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer. A subarray is a contiguous subsequence of the array.',
      examples: [
        {
          input: 'nums = [2,3,-2,4]',
          output: '6',
          explanation: '[2,3] has the largest product 6.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 2 * 10^4',
        '-10 <= nums[i] <= 10',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'
      ],
      isCustom: false
    },
    {
      slug: 'find-minimum-in-rotated-sorted-array',
      title: 'Find Minimum in Rotated Sorted Array',
      difficulty: 'MEDIUM' as const,
      patterns: ['Binary Search'],
      cues: ['sorted array', 'find target', 'half elimination', 'logarithmic time'],
      description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. For example, the array nums = [0,1,2,4,5,6,7] might become [4,5,6,7,0,1,2] if it was rotated 4 times. Given the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.',
      examples: [
        {
          input: 'nums = [3,4,5,1,2]',
          output: '1'
        }
      ],
      constraints: [
        'n == nums.length',
        '1 <= n <= 5000',
        '-5000 <= nums[i] <= 5000',
        'All the integers of nums are unique.',
        'nums is sorted and rotated between 1 and n times.'
      ],
      isCustom: false
    },
    {
      slug: 'search-in-rotated-sorted-array',
      title: 'Search in Rotated Sorted Array',
      difficulty: 'MEDIUM' as const,
      patterns: ['Binary Search'],
      cues: ['sorted array', 'find target', 'half elimination', 'logarithmic time'],
      description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]] (0-indexed). For example, [0,1,2,4,5,6,7] might be rotated at pivot index 3 and become [4,5,6,7,0,1,2]. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.',
      examples: [
        {
          input: 'nums = [4,5,6,7,0,1,2], target = 0',
          output: '4'
        }
      ],
      constraints: [
        '1 <= nums.length <= 5000',
        '-10^4 <= nums[i] <= 10^4',
        'All values of nums are unique.',
        'nums is an ascending array that is possibly rotated.',
        '-10^4 <= target <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: '3sum',
      title: '3Sum',
      difficulty: 'MEDIUM' as const,
      patterns: ['Two Pointers', 'Sorting'],
      cues: ['sorted array', 'opposite ends', 'move pointers', 'pair/triplet search'],
      description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
      examples: [
        {
          input: 'nums = [-1,0,1,2,-1,-4]',
          output: '[[-1,-1,2],[-1,0,1]]'
        }
      ],
      constraints: [
        '3 <= nums.length <= 3000',
        '-10^5 <= nums[i] <= 10^5'
      ],
      isCustom: false
    },
    {
      slug: 'container-with-most-water',
      title: 'Container With Most Water',
      difficulty: 'MEDIUM' as const,
      patterns: ['Two Pointers', 'Greedy'],
      cues: ['opposite ends', 'move pointers', 'local optimum', 'no backtracking'],
      description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store. Notice that you may not slant the container.',
      examples: [
        {
          input: 'height = [1,8,6,2,5,4,8,3,7]',
          output: '49',
          explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.'
        }
      ],
      constraints: [
        'n == height.length',
        '2 <= n <= 10^5',
        '0 <= height[i] <= 10^4'
      ],
      isCustom: false
    }
  ];

  // Insert problems
  for (const problemData of problems) {
    const problem = await prisma.problem.upsert({
      where: { slug: problemData.slug },
      update: {},
      create: problemData
    });

    // Create test cases for each problem
    if (problemData.slug === 'two-sum') {
      await prisma.testCase.createMany({
        data: [
          {
            problemId: problem.id,
            input: '4\n2 7 11 15\n9',
            expected: '[0,1]',
            weight: 1.0,
            isExample: true
          },
          {
            problemId: problem.id,
            input: '3\n3 2 4\n6',
            expected: '[1,2]',
            weight: 1.0,
            isExample: false
          }
        ]
      });
    } else if (problemData.slug === 'best-time-to-buy-and-sell-stock') {
      await prisma.testCase.createMany({
        data: [
          {
            problemId: problem.id,
            input: '6\n7 1 5 3 6 4',
            expected: '5',
            weight: 1.0,
            isExample: true
          },
          {
            problemId: problem.id,
            input: '5\n7 6 4 3 1',
            expected: '0',
            weight: 1.0,
            isExample: false
          }
        ]
      });
    } else if (problemData.slug === 'contains-duplicate') {
      await prisma.testCase.createMany({
        data: [
          {
            problemId: problem.id,
            input: '4\n1 2 3 1',
            expected: 'true',
            weight: 1.0,
            isExample: true
          },
          {
            problemId: problem.id,
            input: '4\n1 2 3 4',
            expected: 'false',
            weight: 1.0,
            isExample: false
          }
        ]
      });
    }
    // Add more test cases for other problems as needed
  }

  // Insert additional problems from our 10-problem dataset
  const additionalProblems = [
    {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'EASY' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'variable window', 'contiguous elements'],
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      examples: [
        {
          input: 'prices = [7,1,5,3,6,4]',
          output: '5',
          explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
        }
      ],
      constraints: [
        '1 <= prices.length <= 10^5',
        '0 <= prices[i] <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: 'contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'EASY' as const,
      patterns: ['Hash Map', 'Sorting'],
      cues: ['frequency counting', 'duplicate detection', 'arrange elements', 'comparison-based'],
      description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
      examples: [
        {
          input: 'nums = [1,2,3,1]',
          output: 'true'
        },
        {
          input: 'nums = [1,2,3,4]',
          output: 'false'
        }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^9 <= nums[i] <= 10^9'
      ],
      isCustom: false
    },
    {
      slug: 'product-of-array-except-self',
      title: 'Product of Array Except Self',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Two Pointers'],
      cues: ['optimal substructure', 'overlapping subproblems', 'opposite ends', 'move pointers'],
      description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operator.',
      examples: [
        {
          input: 'nums = [1,2,3,4]',
          output: '[24,12,8,6]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^5',
        '-30 <= nums[i] <= 30',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'
      ],
      isCustom: false
    },
    {
      slug: 'maximum-subarray',
      title: 'Maximum Subarray',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'subarray', 'contiguous elements'],
      description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. A subarray is a contiguous part of an array.',
      examples: [
        {
          input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
          output: '6',
          explanation: '[4,-1,2,1] has the largest sum = 6.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: 'maximum-product-subarray',
      title: 'Maximum Product Subarray',
      difficulty: 'MEDIUM' as const,
      patterns: ['Dynamic Programming', 'Sliding Window'],
      cues: ['optimal substructure', 'overlapping subproblems', 'subarray', 'contiguous elements'],
      description: 'Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer. A subarray is a contiguous subsequence of the array.',
      examples: [
        {
          input: 'nums = [2,3,-2,4]',
          output: '6',
          explanation: '[2,3] has the largest product 6.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 2 * 10^4',
        '-10 <= nums[i] <= 10',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'
      ],
      isCustom: false
    },
    {
      slug: 'find-minimum-in-rotated-sorted-array',
      title: 'Find Minimum in Rotated Sorted Array',
      difficulty: 'MEDIUM' as const,
      patterns: ['Binary Search'],
      cues: ['sorted array', 'find target', 'half elimination', 'logarithmic time'],
      description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. For example, the array nums = [0,1,2,4,5,6,7] might become [4,5,6,7,0,1,2] if it was rotated 4 times. Given the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.',
      examples: [
        {
          input: 'nums = [3,4,5,1,2]',
          output: '1'
        }
      ],
      constraints: [
        'n == nums.length',
        '1 <= n <= 5000',
        '-5000 <= nums[i] <= 5000',
        'All the integers of nums are unique.',
        'nums is sorted and rotated between 1 and n times.'
      ],
      isCustom: false
    },
    {
      slug: 'search-in-rotated-sorted-array',
      title: 'Search in Rotated Sorted Array',
      difficulty: 'MEDIUM' as const,
      patterns: ['Binary Search'],
      cues: ['sorted array', 'find target', 'half elimination', 'logarithmic time'],
      description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]] (0-indexed). For example, [0,1,2,4,5,6,7] might be rotated at pivot index 3 and become [4,5,6,7,0,1,2]. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.',
      examples: [
        {
          input: 'nums = [4,5,6,7,0,1,2], target = 0',
          output: '4'
        }
      ],
      constraints: [
        '1 <= nums.length <= 5000',
        '-10^4 <= nums[i] <= 10^4',
        'All values of nums are unique.',
        'nums is an ascending array that is possibly rotated.',
        '-10^4 <= target <= 10^4'
      ],
      isCustom: false
    },
    {
      slug: '3sum',
      title: '3Sum',
      difficulty: 'MEDIUM' as const,
      patterns: ['Two Pointers', 'Sorting'],
      cues: ['sorted array', 'opposite ends', 'move pointers', 'pair/triplet search'],
      description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
      examples: [
        {
          input: 'nums = [-1,0,1,2,-1,-4]',
          output: '[[-1,-1,2],[-1,0,1]]'
        }
      ],
      constraints: [
        '3 <= nums.length <= 3000',
        '-10^5 <= nums[i] <= 10^5'
      ],
      isCustom: false
    },
    {
      slug: 'container-with-most-water',
      title: 'Container With Most Water',
      difficulty: 'MEDIUM' as const,
      patterns: ['Two Pointers', 'Greedy'],
      cues: ['opposite ends', 'move pointers', 'local optimum', 'no backtracking'],
      description: 'You are given an integer array height of length n. There are n vertical lines drawn such that: the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store. Notice that you may not slant the container.',
      examples: [
        {
          input: 'height = [1,8,6,2,5,4,8,3,7]',
          output: '49',
          explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.'
        }
      ],
      constraints: [
        'n == height.length',
        '2 <= n <= 10^5',
        '0 <= height[i] <= 10^4'
      ],
      isCustom: false
    }
  ];

  // Insert additional problems
  for (const problemData of additionalProblems) {
    const problem = await prisma.problem.upsert({
      where: { slug: problemData.slug },
      update: {},
      create: problemData
    });
    console.log('✅ Added problem:', problem.title);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });