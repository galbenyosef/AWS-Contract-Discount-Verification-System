# Test Contracts for AWS Discount Verification

This directory contains several test AWS Private Pricing Agreement (PPA) contracts that you can use to test the discount verification system.

## Available Test Contracts

### 1. `aws-ppa-standard.pdf` - Standard Corp Contract

- **Customer**: Standard Corp Inc.
- **Contract Number**: PPA-2024-STD-001
- **Total Commitment**: $450,000 over 3 years
- **Discount Rates**: 15% (Year 1), 18% (Year 2), 20% (Year 3)
- **Annual Commitments**: $100K, $150K, $200K
- **Use Case**: Mid-size company with moderate compliance issues

### 2. `aws-ppa-enterprise.pdf` - Enterprise Solutions Contract

- **Customer**: Enterprise Solutions LLC
- **Contract Number**: PPA-2024-ENT-002
- **Total Commitment**: $2,500,000 over 3 years
- **Discount Rates**: 20% (Year 1), 22% (Year 2), 25% (Year 3)
- **Annual Commitments**: $750K, $850K, $900K
- **Use Case**: Large enterprise with high volumes and better compliance

### 3. `aws-ppa-startup.pdf` - TechStart Innovations Contract

- **Customer**: TechStart Innovations Inc.
- **Contract Number**: PPA-2024-START-003
- **Total Commitment**: $180,000 over 3 years
- **Discount Rates**: 12% (Year 1), 15% (Year 2), 18% (Year 3)
- **Annual Commitments**: $50K, $60K, $70K
- **Use Case**: Startup with lower volumes and significant compliance issues

## How to Test

1. **Upload a Contract**: Drag and drop any of the test PDFs into the application
2. **Enter AWS Credentials**: Use dummy credentials (they won't be validated in mock mode)
3. **Choose Mock Data**: Select the corresponding mock data scenario:
   - **Standard Corp**: Some compliance issues, 85% compliant
   - **Enterprise Solutions**: Minor issues, 95% compliant
   - **TechStart Innovations**: Major issues, 60% compliant

## Mock Data Scenarios

Each contract has corresponding mock billing data that demonstrates different compliance scenarios:

### Standard Corp Mock Data

- **Total Spend**: $9,822.50
- **Expected Discounts**: $1,155 (if all eligible services got 15% discount)
- **Actual Discounts**: $1,030
- **Missing Discounts**: $125 in compliance issues
- **Issues**: CloudFront and DynamoDB missing discounts, ECS partial discount

### Enterprise Solutions Mock Data

- **Total Spend**: $114,290
- **Expected Discounts**: $22,000 (if all eligible services got 20% discount)
- **Actual Discounts**: $21,950
- **Missing Discounts**: $50 in minor compliance issues
- **Issues**: Route 53 only got 10% instead of 20% discount

### TechStart Innovations Mock Data

- **Total Spend**: $2,941
- **Expected Discounts**: $240 (if all eligible services got 12% discount)
- **Actual Discounts**: $120
- **Missing Discounts**: $120 in major compliance issues
- **Issues**: Multiple services missing discounts entirely

## Contract Structure

All test contracts follow the real AWS PPA format with:

- **Section 3.1**: Committed Spend & Commitment Schedule
- **Section 3.2**: Eligible Services (EC2, S3, RDS, Lambda, etc.)
- **Schedule 1**: Excluded Services (Support, Marketplace, Professional Services)
- **Schedule 2**: Eligible Account structure

## Testing Different Scenarios

1. **Upload Standard Contract + Use Standard Mock Data**: Test moderate compliance issues
2. **Upload Enterprise Contract + Use Enterprise Mock Data**: Test high-volume, good compliance
3. **Upload Startup Contract + Use Startup Mock Data**: Test significant compliance problems
4. **Mix and Match**: Upload one contract but use different mock data to see how the system handles mismatched scenarios

This allows you to thoroughly test the discount verification system across different contract sizes, discount rates, and compliance scenarios.
