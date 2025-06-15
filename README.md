# AWS Contract Discount Verification System

## Overview

This application is designed to verify that AWS is correctly applying contract discounts to your billing. It serves as a compliance and audit tool to ensure you're receiving the discounts specified in your AWS Private Pricing Agreement (PPA) or Enterprise Discount Program (EDP) contract.

## How It Works

### 1. Contract Analysis

- Upload your AWS PPA contract PDF
- The system extracts:
  - Contract years with Annual Committed Spend amounts and discount rates
  - Eligible services that should receive discounts
  - Excluded services that should NOT receive discounts (per Schedule 1)

### 2. Billing Data Integration

- Connect to AWS Cost Explorer API using your credentials
- Fetch actual billing data for the specified time period
- Alternative: Use mock data for testing/demonstration

### 3. Discount Verification

The system performs comprehensive discount compliance checking:

#### Service Classification

- **Eligible Services**: Should receive the contracted discount rate
- **Excluded Services**: Should receive NO discount (AWS Support, Marketplace, etc.)
- **Unknown Services**: Services not explicitly listed in the contract

#### Compliance Analysis

For each service, the system calculates:

- **Expected Cost Without Discount**: Reverse-engineered from actual cost
- **Expected Cost With Discount**: What you should pay with contract discount
- **Expected Discount Amount**: Dollar amount of discount you should receive
- **Actual Discount Applied**: Discount that was actually applied by AWS
- **Discrepancy**: Difference between expected and actual discount

#### Compliance Status

- ✅ **Compliant**: Correct discount applied (within $0.01 tolerance)
- ⚠️ **Non-Compliant**: Incorrect or missing discount

## Mock Data Structure

The mock billing data simulates real AWS Cost Explorer API responses and includes various compliance scenarios based on a 15% discount rate:

```javascript
// Eligible services with CORRECT discounts (15% off standard rates)
{ service: "Amazon Elastic Compute Cloud - Compute", cost: 2125.50 }
// Should be 2500.00 without discount - COMPLIANT

// Eligible services with MISSING discounts (charged full price)
{ service: "Amazon CloudFront", cost: 300.00 }
// Should be 255.00 with 15% discount - NON-COMPLIANT ($45 missing discount)

// Excluded services (should have NO discount)
{ service: "AWS Support (Enterprise)", cost: 1200.00 }
// No discount expected - COMPLIANT

// Total mock spend: ~$9,822 (should meet $10,000 commitment with proper discounts)
```

## Key Features

### Dashboard Overview

- Contract discount rate and Annual Committed Spend status
- Total actual spend vs commitment
- Overall compliance status
- Summary of compliant vs non-compliant services

### Detailed Analysis Table

- Service-by-service breakdown
- Eligibility status (Eligible/Excluded/Unknown)
- Expected vs actual discount amounts
- Compliance indicators
- Discrepancy calculations

### Action Items

- List of services with discount issues
- Specific dollar amounts of missing discounts
- Clear identification of compliance problems

## AWS PPA Contract Format

The system expects AWS Private Pricing Agreements with the following structure:

```
3. PRICING, DISCOUNTS AND PAYMENT

3.1 Committed Spend & Commitment Schedule
Contract Year 1: ... Annual Committed Spend = $100,000 with 15% Discount Rate
Contract Year 2: ... Annual Committed Spend = $150,000 with 18% Discount Rate

3.2 Discounted Pricing & Eligible Services
Eligible Services include the majority of generally available AWS cloud services:
- Amazon Elastic Compute Cloud (EC2)
- Amazon Simple Storage Service (S3)
- [additional services...]

SCHEDULE 1 - EXCLUDED SERVICES
The following services are excluded from discount eligibility:
- AWS Marketplace purchases
- AWS Support fees
- [additional exclusions...]
```

## Use Cases

1. **Monthly Compliance Audits**: Verify discounts are being applied correctly
2. **Contract Negotiations**: Understand actual vs expected savings
3. **Financial Reconciliation**: Identify billing discrepancies
4. **Vendor Management**: Hold AWS accountable for PPA contract terms
5. **True-Up Planning**: Ensure you're on track to meet Annual Committed Spend

## Technical Implementation

- **Frontend**: React with Bootstrap 5 styling
- **PDF Processing**: PDF.js for contract parsing
- **AWS Integration**: Cost Explorer API for billing data
- **Discount Logic**: Reverse-engineering actual costs to verify discount application
- **Contract Format**: Supports real AWS PPA structure and terminology

## Sample Analysis Results

Based on the mock data:

- **Total Spend**: $9,822.50
- **Expected Discounts**: $1,155 (if all eligible services got 15% discount)
- **Actual Discounts Applied**: $1,030
- **Missing Discounts**: $125 (compliance issues identified)
- **Compliance Rate**: 85% of services compliant

This tool transforms basic spending tracking into comprehensive discount compliance auditing, ensuring you receive the full value of your AWS Private Pricing Agreement discounts.
