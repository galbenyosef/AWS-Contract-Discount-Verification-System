const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Contract templates with different scenarios
const contracts = [
  {
    filename: "aws-ppa-standard.pdf",
    title: "AWS PPA - Standard 3-Year Contract",
    contractNumber: "PPA-2024-STD-001",
    customer: "Standard Corp Inc.",
    totalCommitment: "$450,000",
    years: [
      {
        year: 1,
        dates: "January 1, 2024 - December 31, 2024",
        commitment: "$100,000",
        discount: "15%",
      },
      {
        year: 2,
        dates: "January 1, 2025 - December 31, 2025",
        commitment: "$150,000",
        discount: "18%",
      },
      {
        year: 3,
        dates: "January 1, 2026 - December 31, 2026",
        commitment: "$200,000",
        discount: "20%",
      },
    ],
  },
  {
    filename: "aws-ppa-enterprise.pdf",
    title: "AWS PPA - Enterprise High-Volume Contract",
    contractNumber: "PPA-2024-ENT-002",
    customer: "Enterprise Solutions LLC",
    totalCommitment: "$2,500,000",
    years: [
      {
        year: 1,
        dates: "March 1, 2024 - February 28, 2025",
        commitment: "$750,000",
        discount: "20%",
      },
      {
        year: 2,
        dates: "March 1, 2025 - February 28, 2026",
        commitment: "$850,000",
        discount: "22%",
      },
      {
        year: 3,
        dates: "March 1, 2026 - February 28, 2027",
        commitment: "$900,000",
        discount: "25%",
      },
    ],
  },
  {
    filename: "aws-ppa-startup.pdf",
    title: "AWS PPA - Startup Growth Contract",
    contractNumber: "PPA-2024-START-003",
    customer: "TechStart Innovations Inc.",
    totalCommitment: "$180,000",
    years: [
      {
        year: 1,
        dates: "July 1, 2024 - June 30, 2025",
        commitment: "$50,000",
        discount: "12%",
      },
      {
        year: 2,
        dates: "July 1, 2025 - June 30, 2026",
        commitment: "$60,000",
        discount: "15%",
      },
      {
        year: 3,
        dates: "July 1, 2026 - June 30, 2027",
        commitment: "$70,000",
        discount: "18%",
      },
    ],
  },
];

function generateContractHTML(contract) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contract.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #0066cc;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            font-size: 14pt;
        }
        .section h3 {
            color: #333;
            font-size: 12pt;
            margin-top: 20px;
        }
        .commitment-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 15px 0;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .terms {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #0066cc;
        }
        .signature-section {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }
        .signature-block {
            display: inline-block;
            width: 45%;
            vertical-align: top;
            margin-right: 5%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AWS PRIVATE PRICING AGREEMENT</h1>
        <p><strong>Contract Number:</strong> ${contract.contractNumber}</p>
        <p><strong>Customer:</strong> ${contract.customer}</p>
        <p><strong>Effective Date:</strong> ${
          contract.years[0].dates.split(" - ")[0]
        }</p>
        <p><strong>Term:</strong> Three (3) years ending ${
          contract.years[2].dates.split(" - ")[1]
        }</p>
    </div>

    <div class="section">
        <h2>3. PRICING, DISCOUNTS AND PAYMENT</h2>
        
        <h3>3.1 Committed Spend & Commitment Schedule</h3>
        <p>During the Term, Customer commits to meet or exceed certain minimum spending levels on AWS services. Customer's total commitment over the entire Term (Total Committed Spend) is <strong>${
          contract.totalCommitment
        }</strong>. The committed amounts and corresponding discount rates are as follows:</p>
        
        <div class="commitment-details">
            <ul>
                ${contract.years
                  .map(
                    (year) =>
                      `<li><strong>Contract Year ${year.year}:</strong> ${year.dates} – Annual Committed Spend = ${year.commitment} with ${year.discount} Discount Rate on Eligible Services</li>`
                  )
                  .join("")}
            </ul>
        </div>

        <h3>3.2 Discounted Pricing & Eligible Services</h3>
        <p>In consideration of Customer's commitments, AWS will apply the specified Discount Rate to Customer's charges for Eligible Services during the Term. The discount is applied as a percentage off AWS's standard pay-as-you-go rates.</p>
        
        <p><strong>Eligible Services</strong> include the majority of generally available AWS cloud services across all AWS regions, including but not limited to:</p>
        <ul>
            <li>Amazon Elastic Compute Cloud (EC2)</li>
            <li>Amazon Simple Storage Service (S3)</li>
            <li>Amazon Relational Database Service (RDS)</li>
            <li>AWS Lambda</li>
            <li>Amazon CloudFront</li>
            <li>Amazon DynamoDB</li>
            <li>Amazon Elastic Container Service (ECS)</li>
            <li>Amazon CloudWatch</li>
            <li>Amazon Virtual Private Cloud (VPC)</li>
            <li>Amazon Elastic Load Balancing</li>
            <li>Amazon Route 53</li>
            <li>Amazon Simple Notification Service (SNS)</li>
            <li>Amazon Simple Queue Service (SQS)</li>
        </ul>
    </div>

    <div class="section">
        <h2>SCHEDULE 1 - EXCLUDED SERVICES</h2>
        <p>The following services are excluded from discount eligibility and do not count toward the Annual Committed Spend:</p>
        <ul>
            <li>AWS Marketplace purchases (except up to 25% of annual commitment as negotiated)</li>
            <li>AWS Support fees (including Enterprise Support)</li>
            <li>AWS Professional Services</li>
            <li>Third-party software licenses</li>
            <li>Reserved Instance purchases made outside this agreement</li>
            <li>Savings Plans purchases made outside this agreement</li>
            <li>AWS Training and Certification fees</li>
            <li>Data transfer charges for content delivery to end users</li>
        </ul>
    </div>

    <div class="section">
        <h2>SCHEDULE 2 - ELIGIBLE ACCOUNTS</h2>
        <p>This Agreement applies to the following AWS account structure:</p>
        <ul>
            <li><strong>Master Payer Account:</strong> ${
              Math.floor(Math.random() * 900000000000) + 100000000000
            } (${contract.customer.split(" ")[0]} - Production)</li>
            <li><strong>Linked Accounts:</strong> All current and future accounts under the AWS Organizations structure managed by the Master Payer Account</li>
        </ul>
    </div>

    <div class="section">
        <h2>KEY TERMS SUMMARY</h2>
        <div class="terms">
            <p><strong>Annual Committed Spend:</strong> The minimum annual dollar amount of AWS Service usage charges that Customer commits to incur during each Contract Year.</p>
            
            <p><strong>Discount Rate:</strong> The percentage discount off AWS's standard pay-as-you-go service fees applied to Eligible Services. Rates: ${contract.years
              .map((y) => `${y.discount} (Year ${y.year})`)
              .join(", ")}.</p>
            
            <p><strong>True-Up Mechanism:</strong> If actual spend falls short of committed amount in any Contract Year, Customer will be invoiced for the shortfall amount, which will be applied as credit for future usage.</p>
            
            <p><strong>Enterprise Support Required:</strong> Customer must maintain AWS Enterprise Support throughout the Term as a condition of this agreement.</p>
        </div>
    </div>

    <div class="signature-section">
        <p>The Parties have caused this AWS Private Pricing Agreement to be executed by their duly authorized representatives as of the Effective Date.</p>
        
        <div class="signature-block">
            <p><strong>Amazon Web Services, Inc.</strong></p>
            <p>By: _________________________</p>
            <p>Name: _______________________</p>
            <p>Title: ______________________</p>
            <p>Date: _______________________</p>
        </div>
        
        <div class="signature-block">
            <p><strong>${contract.customer}</strong></p>
            <p>By: _________________________</p>
            <p>Name: _______________________</p>
            <p>Title: ______________________</p>
            <p>Date: _______________________</p>
        </div>
    </div>
</body>
</html>`;
}

async function generatePDFs() {
  console.log("Starting PDF generation...");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const contract of contracts) {
    console.log(`Generating ${contract.filename}...`);

    const html = generateContractHTML(contract);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = path.join(publicDir, contract.filename);
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    console.log(`✅ Generated ${contract.filename}`);
  }

  await browser.close();
  console.log("🎉 All test contracts generated successfully!");
  console.log("\nGenerated files:");
  contracts.forEach((contract) => {
    console.log(`- public/${contract.filename} (${contract.title})`);
  });
}

generatePDFs().catch(console.error);
