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
      patterns: ['Two Pointers', 'Hash Map'],
      cues: ['Find two numbers that add up to target', 'Use hash map for O(n) solution'],
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
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
        '-10^9 <= target <= 10^9'
      ],
      isCustom: false
    },
    {
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'EASY' as const,
      patterns: ['Stack'],
      cues: ['Use stack to track opening brackets', 'Match closing brackets with opening ones'],
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      examples: [
        {
          input: 's = "()"',
          output: 'true',
          explanation: 'The string contains valid parentheses.'
        }
      ],
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only \'()[]{}\'.'
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
    }
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
