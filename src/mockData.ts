// Mock billing data sets for different contract scenarios

type BillingItem = {
  service: string;
  cost: number;
};

type MockDataSet = {
  name: string;
  description: string;
  data: BillingItem[];
};

export const mockDataSets: Record<string, MockDataSet> = {
  standard: {
    name: "Standard Corp - Year 1 (15% discount)",
    description:
      "Mock data for Standard Corp contract with some compliance issues",
    data: [
      // Eligible services with CORRECT discounts applied (15% off standard rates)
      { service: "Amazon Elastic Compute Cloud - Compute", cost: 2125.5 }, // Should be 2500.00 without discount
      { service: "Amazon Simple Storage Service", cost: 425.0 }, // Should be 500.00 without discount
      { service: "Amazon Relational Database Service", cost: 850.0 }, // Should be 1000.00 without discount
      { service: "AWS Lambda", cost: 127.5 }, // Should be 150.00 without discount
      { service: "Amazon CloudWatch", cost: 85.0 }, // Should be 100.00 without discount

      // Eligible services with MISSING discounts (charged full price - compliance issues)
      { service: "Amazon CloudFront", cost: 300.0 }, // Should be 255.00 with 15% discount
      { service: "Amazon DynamoDB", cost: 200.0 }, // Should be 170.00 with 15% discount

      // Eligible services with PARTIAL discounts (wrong discount rate applied)
      { service: "Amazon Elastic Container Service", cost: 450.0 }, // Should be 425.00 with 15% discount (only got 10% discount)

      // Excluded services (should have NO discount - these are correct)
      { service: "AWS Support (Enterprise)", cost: 1200.0 }, // Excluded service, no discount expected
      { service: "AWS Marketplace - Third Party Software", cost: 500.0 }, // Excluded service, no discount expected
      { service: "AWS Professional Services", cost: 2500.0 }, // Excluded service, no discount expected

      // Additional eligible services with correct discounts
      { service: "Amazon Virtual Private Cloud", cost: 42.5 }, // Should be 50.00 without discount
      { service: "Amazon Simple Notification Service", cost: 17.0 }, // Should be 20.00 without discount
    ],
  },

  enterprise: {
    name: "Enterprise Solutions - Year 1 (20% discount)",
    description:
      "Mock data for Enterprise contract with higher volumes and better compliance",
    data: [
      // Eligible services with CORRECT discounts applied (20% off standard rates)
      { service: "Amazon Elastic Compute Cloud - Compute", cost: 24000.0 }, // Should be 30000.00 without discount
      { service: "Amazon Simple Storage Service", cost: 8000.0 }, // Should be 10000.00 without discount
      { service: "Amazon Relational Database Service", cost: 16000.0 }, // Should be 20000.00 without discount
      { service: "AWS Lambda", cost: 2400.0 }, // Should be 3000.00 without discount
      { service: "Amazon CloudWatch", cost: 1600.0 }, // Should be 2000.00 without discount
      { service: "Amazon CloudFront", cost: 4000.0 }, // Should be 5000.00 without discount
      { service: "Amazon DynamoDB", cost: 3200.0 }, // Should be 4000.00 without discount
      { service: "Amazon Elastic Container Service", cost: 6400.0 }, // Should be 8000.00 without discount

      // Minor compliance issue - one service with partial discount
      { service: "Amazon Route 53", cost: 450.0 }, // Should be 400.00 with 20% discount (only got 10% discount)

      // Excluded services (should have NO discount - these are correct)
      { service: "AWS Support (Enterprise)", cost: 15000.0 }, // Excluded service, no discount expected
      { service: "AWS Marketplace - Enterprise Software", cost: 8000.0 }, // Excluded service, no discount expected
      { service: "AWS Professional Services", cost: 25000.0 }, // Excluded service, no discount expected

      // Additional eligible services with correct discounts
      { service: "Amazon Virtual Private Cloud", cost: 800.0 }, // Should be 1000.00 without discount
      { service: "Amazon Simple Notification Service", cost: 240.0 }, // Should be 300.00 without discount
      { service: "Amazon Simple Queue Service", cost: 160.0 }, // Should be 200.00 without discount
    ],
  },

  startup: {
    name: "TechStart Innovations - Year 1 (12% discount)",
    description:
      "Mock data for Startup contract with lower volumes and mixed compliance",
    data: [
      // Eligible services with CORRECT discounts applied (12% off standard rates)
      { service: "Amazon Elastic Compute Cloud - Compute", cost: 880.0 }, // Should be 1000.00 without discount
      { service: "Amazon Simple Storage Service", cost: 176.0 }, // Should be 200.00 without discount
      { service: "Amazon Relational Database Service", cost: 440.0 }, // Should be 500.00 without discount
      { service: "AWS Lambda", cost: 88.0 }, // Should be 100.00 without discount

      // Eligible services with MISSING discounts (charged full price - major compliance issues)
      { service: "Amazon CloudFront", cost: 150.0 }, // Should be 132.00 with 12% discount
      { service: "Amazon DynamoDB", cost: 100.0 }, // Should be 88.00 with 12% discount
      { service: "Amazon Elastic Container Service", cost: 200.0 }, // Should be 176.00 with 12% discount
      { service: "Amazon CloudWatch", cost: 75.0 }, // Should be 66.00 with 12% discount

      // Excluded services (should have NO discount - these are correct)
      { service: "AWS Support (Business)", cost: 500.0 }, // Excluded service, no discount expected
      { service: "AWS Marketplace - Development Tools", cost: 300.0 }, // Excluded service, no discount expected

      // Additional eligible services with mixed compliance
      { service: "Amazon Virtual Private Cloud", cost: 22.0 }, // Should be 25.00 without discount - CORRECT
      { service: "Amazon Simple Notification Service", cost: 10.0 }, // Should be 8.80 with 12% discount - MISSING DISCOUNT
    ],
  },
};

export default mockDataSets;
