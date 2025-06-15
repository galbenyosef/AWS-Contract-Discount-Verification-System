import React, { useState, useCallback } from "react";
import ContractUploader from "./ContractUploader";
import AwsCredentialsForm, { type AwsCredentials } from "./AwsCredentialsForm";
import BillingFetcher from "./BillingFetcher";
import BillingAnalyzer from "./BillingAnalyzer";
import StepWizard from "./components/StepWizard";
import Toast from "./components/Toast";
import { mockDataSets } from "./mockData";

type ContractData = {
  years: {
    year: number;
    committedSpend: number;
    discountRate: number;
  }[];
  eligibleServices: string[];
  excludedServices: string[];
};

type BillingItem = {
  service: string;
  cost: number;
};

const App: React.FC = () => {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [creds, setCreds] = useState<AwsCredentials | null>(null);
  const [billing, setBilling] = useState<BillingItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [dateRange] = useState<{ start: string; end: string }>(() => {
    // Use the previous month as a realistic date range
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      start: lastMonth.toISOString().split("T")[0],
      end: endOfLastMonth.toISOString().split("T")[0],
    };
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const handleContractParsed = (parsed: ContractData) => {
    setContract(parsed);
    setToast({
      message: "Contract uploaded and parsed successfully!",
      type: "success",
      isVisible: true,
    });
    if (parsed.years.length > 0) {
      setSelectedYear(parsed.years[0].year);
    }
  };

  const handleCredsSubmit = (c: AwsCredentials) => {
    setCreds(c);
    setToast({
      message: "AWS credentials saved successfully!",
      type: "success",
      isVisible: true,
    });
  };

  const handleBillingFetched = (data: BillingItem[]) => {
    setBilling(data);
    setToast({
      message: "Billing data fetched successfully!",
      type: "success",
      isVisible: true,
    });
  };

  const handleError = useCallback((message: string) => {
    setToast({
      message,
      type: "error",
      isVisible: true,
    });
  }, []);

  const handleUseMockData = useCallback((mockType: string = "standard") => {
    const mockDataSet = mockDataSets[mockType as keyof typeof mockDataSets];
    if (mockDataSet) {
      setBilling(mockDataSet.data);
      setToast({
        message: `Using mock data: ${mockDataSet.name} - ${mockDataSet.description}`,
        type: "info",
        isVisible: true,
      });
    }
  }, []);

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const steps = [
    {
      title: "Upload Contract",
      description: "Upload your AWS contract PDF",
      isCompleted: !!contract,
      isActive: !contract,
    },
    {
      title: "AWS Credentials",
      description: "Enter your AWS credentials",
      isCompleted: !!creds,
      isActive: !!contract && !creds,
    },
    {
      title: "Fetch Data",
      description: "Fetch billing data from AWS",
      isCompleted: billing.length > 0,
      isActive: !!contract && !!creds && billing.length === 0,
    },
    {
      title: "Analysis",
      description: "View billing analysis",
      isCompleted: billing.length > 0,
      isActive: billing.length > 0,
    },
  ];

  const showMockDataButton = contract && creds && billing.length === 0;

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <div className="container py-5" style={{ maxWidth: "1000px" }}>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            AWS Contract Analysis
          </h1>
          <p className="lead text-muted">
            Upload your AWS contract and analyze your billing data for discount
            compliance
          </p>
        </div>

        <div className="mb-4">
          <StepWizard steps={steps} />
        </div>

        {showMockDataButton && (
          <div className="mb-4">
            <div className="card card-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <i
                      className="bi bi-database me-3 text-primary"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                    <div>
                      <h6 className="mb-1 fw-bold">Test with Mock Data</h6>
                      <small className="text-muted">
                        Choose a scenario to test the discount verification
                        system
                      </small>
                    </div>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-md-4">
                    <button
                      onClick={() => handleUseMockData("standard")}
                      className="btn btn-outline-primary w-100"
                    >
                      <div className="text-start">
                        <div className="fw-bold">Standard Corp</div>
                        <small>15% discount, some issues</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      onClick={() => handleUseMockData("enterprise")}
                      className="btn btn-outline-success w-100"
                    >
                      <div className="text-start">
                        <div className="fw-bold">Enterprise Solutions</div>
                        <small>20% discount, high volume</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      onClick={() => handleUseMockData("startup")}
                      className="btn btn-outline-warning w-100"
                    >
                      <div className="text-start">
                        <div className="fw-bold">TechStart Innovations</div>
                        <small>12% discount, many issues</small>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-12">
            {!contract && (
              <ContractUploader
                onParsed={handleContractParsed}
                onError={handleError}
              />
            )}
            {contract && !creds && (
              <AwsCredentialsForm onSubmit={handleCredsSubmit} />
            )}
            {contract && creds && billing.length === 0 && (
              <BillingFetcher
                credentials={creds}
                startDate={dateRange.start}
                endDate={dateRange.end}
                onFetched={handleBillingFetched}
                onError={handleError}
              />
            )}
            {contract && creds && billing.length > 0 && (
              <div className="row g-4">
                <div className="col-12">
                  <div className="alert alert-success d-flex align-items-center">
                    <i className="bi bi-check-circle me-3"></i>
                    <span>
                      Billing data loaded successfully! ({billing.length}{" "}
                      services found)
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <BillingAnalyzer
                    contract={contract}
                    billing={billing}
                    selectedYear={selectedYear}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default App;
