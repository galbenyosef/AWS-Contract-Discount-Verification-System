import React, { useCallback, useState, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Configure PDF.js worker - use the CDN version that works
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type ContractData = {
  years: {
    year: number;
    committedSpend: number;
    discountRate: number;
  }[];
  eligibleServices: string[];
  excludedServices: string[];
};

type Props = {
  onParsed: (parsed: ContractData) => void;
  onError: (message: string) => void;
};

type TextItem = {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
};

const parseContractText = (text: string): ContractData => {
  const years: ContractData["years"] = [];
  const eligibleServices: string[] = [];
  const excludedServices: string[] = [];

  // Updated regex to match AWS PPA format: "Contract Year X: ... Annual Committed Spend = $X with Y% Discount Rate"
  const yearRegex =
    /Contract Year (\d+):.*?Annual Committed Spend\s*=\s*\$?([\d,]+).*?with\s+([\d.]+)%\s*Discount Rate/gi;
  let match;
  while ((match = yearRegex.exec(text)) !== null) {
    years.push({
      year: parseInt(match[1]),
      committedSpend: parseInt(match[2].replace(/,/g, "")),
      discountRate: parseFloat(match[3]),
    });
  }

  // Parse eligible services - look for AWS PPA format with "Eligible Services include"
  // Updated to handle both HTML and plain text formats
  const eligibleMatch = text.match(
    /Eligible Services.*?include.*?(?:but not limited to:)?\s*(.*?)(?=SCHEDULE 1|EXCLUDED SERVICES|The following services are excluded|$)/is
  );

  if (eligibleMatch) {
    const serviceText = eligibleMatch[1];

    // Split by common delimiters and clean up
    const lines = serviceText.split(/[\n\r]+/);

    for (const line of lines) {
      const cleanLine = line.trim();

      // Skip empty lines or lines that are too short
      if (!cleanLine || cleanLine.length < 5) continue;

      // Check for service names directly in the text
      if (
        cleanLine.includes("Elastic Compute Cloud") ||
        cleanLine.includes("EC2")
      ) {
        eligibleServices.push("Elastic Compute Cloud");
      }
      if (
        cleanLine.includes("Simple Storage Service") ||
        cleanLine.includes("S3")
      ) {
        eligibleServices.push("Simple Storage Service");
      }
      if (
        cleanLine.includes("Relational Database Service") ||
        cleanLine.includes("RDS")
      ) {
        eligibleServices.push("Relational Database Service");
      }
      if (cleanLine.includes("Lambda")) {
        eligibleServices.push("Lambda");
      }
      if (cleanLine.includes("CloudFront")) {
        eligibleServices.push("CloudFront");
      }
      if (cleanLine.includes("DynamoDB")) {
        eligibleServices.push("DynamoDB");
      }
      if (
        cleanLine.includes("Elastic Container Service") ||
        cleanLine.includes("ECS")
      ) {
        eligibleServices.push("Elastic Container Service");
      }
      if (cleanLine.includes("CloudWatch")) {
        eligibleServices.push("CloudWatch");
      }
      if (
        cleanLine.includes("Virtual Private Cloud") ||
        cleanLine.includes("VPC")
      ) {
        eligibleServices.push("Virtual Private Cloud");
      }
      if (cleanLine.includes("Elastic Load Balancing")) {
        eligibleServices.push("Elastic Load Balancing");
      }
      if (cleanLine.includes("Route 53")) {
        eligibleServices.push("Route 53");
      }
      if (
        cleanLine.includes("Simple Notification Service") ||
        cleanLine.includes("SNS")
      ) {
        eligibleServices.push("Simple Notification Service");
      }
      if (
        cleanLine.includes("Simple Queue Service") ||
        cleanLine.includes("SQS")
      ) {
        eligibleServices.push("Simple Queue Service");
      }
    }
  }

  // If we still don't have eligible services, try a more aggressive approach
  if (eligibleServices.length === 0) {
    // Look for service names anywhere in the text after "Eligible Services"
    const eligibleSectionMatch = text.match(/Eligible Services.*$/is);
    if (eligibleSectionMatch) {
      const remainingText = eligibleSectionMatch[0];

      // Check for each service name in the remaining text
      const servicePatterns = [
        {
          pattern: /Elastic Compute Cloud|EC2/i,
          name: "Elastic Compute Cloud",
        },
        {
          pattern: /Simple Storage Service|S3/i,
          name: "Simple Storage Service",
        },
        {
          pattern: /Relational Database Service|RDS/i,
          name: "Relational Database Service",
        },
        { pattern: /Lambda/i, name: "Lambda" },
        { pattern: /CloudFront/i, name: "CloudFront" },
        { pattern: /DynamoDB/i, name: "DynamoDB" },
        {
          pattern: /Elastic Container Service|ECS/i,
          name: "Elastic Container Service",
        },
        { pattern: /CloudWatch/i, name: "CloudWatch" },
        {
          pattern: /Virtual Private Cloud|VPC/i,
          name: "Virtual Private Cloud",
        },
        { pattern: /Elastic Load Balancing/i, name: "Elastic Load Balancing" },
        { pattern: /Route 53/i, name: "Route 53" },
        {
          pattern: /Simple Notification Service|SNS/i,
          name: "Simple Notification Service",
        },
        { pattern: /Simple Queue Service|SQS/i, name: "Simple Queue Service" },
      ];

      for (const { pattern, name } of servicePatterns) {
        if (pattern.test(remainingText) && !eligibleServices.includes(name)) {
          eligibleServices.push(name);
        }
      }
    }
  }

  // Parse excluded services - look for "SCHEDULE 1 - EXCLUDED SERVICES" or similar
  const excludedMatch = text.match(
    /(?:SCHEDULE 1.*?EXCLUDED SERVICES|EXCLUDED SERVICES).*?(?:excluded from.*?eligibility)?\s*(.*?)(?=SCHEDULE 2|KEY TERMS|SIGNATURE|$)/is
  );
  if (excludedMatch) {
    const serviceText = excludedMatch[1];

    // Split by lines and check for service names
    const lines = serviceText.split(/[\n\r]+/);

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.length < 5) continue;

      if (cleanLine.includes("Marketplace")) {
        excludedServices.push("Marketplace");
      }
      if (cleanLine.includes("Support")) {
        excludedServices.push("Support");
      }
      if (cleanLine.includes("Professional Services")) {
        excludedServices.push("Professional Services");
      }
      if (cleanLine.includes("Training")) {
        excludedServices.push("Training");
      }
      if (cleanLine.includes("Reserved Instance")) {
        excludedServices.push("Reserved Instance");
      }
      if (cleanLine.includes("Savings Plans")) {
        excludedServices.push("Savings Plans");
      }
    }
  }

  return { years, eligibleServices, excludedServices };
};

const ContractUploader: React.FC<Props> = ({ onParsed, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file) {
        onError("No file selected");
        return;
      }

      if (file.type !== "application/pdf") {
        onError("Please upload a PDF file");
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          setIsLoading(true);
          setProgress(0);

          const data = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await getDocument({ data }).promise;
          let fullText = "";

          // Update progress based on number of pages
          const totalPages = pdf.numPages;
          for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .filter((item): item is TextItem => "str" in item)
              .map((item) => item.str)
              .join(" ");
            fullText += " " + pageText;

            // Update progress based on pages processed
            setProgress(Math.round((i / totalPages) * 100));
          }

          const parsed = parseContractText(fullText);

          if (parsed.years.length === 0) {
            onError("No contract years found in the document");
            return;
          }

          if (parsed.eligibleServices.length === 0) {
            onError("No eligible services found in the document");
            return;
          }

          onParsed(parsed);
        } catch (error) {
          console.error("Error processing PDF:", error);
          onError("Error processing PDF file. Please try again.");
        } finally {
          setIsLoading(false);
          setProgress(0);
        }
      };

      reader.onerror = () => {
        onError("Error reading file. Please try again.");
      };

      reader.readAsArrayBuffer(file);
    },
    [onParsed, onError]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="card card-shadow">
      <div className="card-body p-4">
        <h2 className="card-title h4 mb-3">Upload Contract</h2>
        <div
          className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          {isLoading ? (
            <div className="text-center">
              <div className="progress mb-3" style={{ height: "8px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <p className="text-muted mb-0">
                Processing contract... {progress}%
              </p>
            </div>
          ) : (
            <div className="text-center">
              <i className="bi bi-cloud-upload display-1 text-muted mb-3"></i>
              <div>
                {isDragActive ? (
                  <p className="h5 text-primary mb-2">
                    Drop your contract here
                  </p>
                ) : (
                  <>
                    <p className="h5 mb-2">Drag and drop your AWS contract</p>
                    <p className="text-muted mb-2">or click to select a file</p>
                    <small className="text-muted">
                      Only PDF files are supported
                    </small>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractUploader;
