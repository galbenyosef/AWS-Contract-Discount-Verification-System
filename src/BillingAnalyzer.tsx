import React, { useState } from "react";

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

type Props = {
  contract: ContractData;
  billing: BillingItem[];
  selectedYear: number;
};

type ServiceAnalysis = {
  service: string;
  actualCost: number;
  isEligible: boolean;
  isExcluded: boolean;
  expectedCostWithDiscount: number;
  expectedCostWithoutDiscount: number;
  discountApplied: number;
  expectedDiscount: number;
  discountCompliant: boolean;
  discrepancy: number;
};

const BillingAnalyzer: React.FC<Props> = ({
  contract,
  billing,
  selectedYear,
}) => {
  const [selectedYearState, setSelectedYearState] = useState(selectedYear);

  const yearData = contract.years.find((y) => y.year === selectedYearState);

  if (!yearData) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No contract data found for year {selectedYearState}
      </div>
    );
  }

  // Analyze each service for discount compliance
  const serviceAnalyses: ServiceAnalysis[] = billing.map((item) => {
    const serviceName = item.service.toLowerCase();

    // Check if service is explicitly excluded
    const isExcluded = contract.excludedServices.some(
      (excluded) =>
        serviceName.includes(excluded.toLowerCase()) ||
        excluded.toLowerCase().includes(serviceName)
    );

    // Check if service is eligible (if not excluded and in eligible list, or if eligible list is empty)
    const isEligible =
      !isExcluded &&
      (contract.eligibleServices.length === 0 ||
        contract.eligibleServices.some(
          (eligible) =>
            serviceName.includes(eligible.toLowerCase()) ||
            eligible.toLowerCase().includes(serviceName)
        ));

    // Calculate expected costs
    const expectedCostWithoutDiscount =
      item.cost / (1 - yearData.discountRate / 100);
    const expectedCostWithDiscount =
      expectedCostWithoutDiscount * (1 - yearData.discountRate / 100);
    const expectedDiscount =
      expectedCostWithoutDiscount - expectedCostWithDiscount;

    // Calculate actual discount applied (reverse engineering)
    const discountApplied = expectedCostWithoutDiscount - item.cost;

    // Check compliance
    const discountCompliant = isEligible
      ? Math.abs(discountApplied - expectedDiscount) < 0.01
      : Math.abs(discountApplied) < 0.01; // Should be no discount for ineligible services

    const discrepancy = isEligible
      ? expectedDiscount - discountApplied
      : -discountApplied;

    return {
      service: item.service,
      actualCost: item.cost,
      isEligible,
      isExcluded,
      expectedCostWithDiscount,
      expectedCostWithoutDiscount,
      discountApplied,
      expectedDiscount: isEligible ? expectedDiscount : 0,
      discountCompliant,
      discrepancy,
    };
  });

  // Calculate totals
  const totalActualCost = billing.reduce((sum, item) => sum + item.cost, 0);
  const totalExpectedDiscount = serviceAnalyses
    .filter((s) => s.isEligible)
    .reduce((sum, s) => sum + s.expectedDiscount, 0);
  const totalActualDiscount = serviceAnalyses.reduce(
    (sum, s) => sum + s.discountApplied,
    0
  );
  const totalDiscrepancy = serviceAnalyses.reduce(
    (sum, s) => sum + s.discrepancy,
    0
  );

  const isCommitmentMet = totalActualCost >= yearData.committedSpend;
  const commitmentShortfall = Math.max(
    0,
    yearData.committedSpend - totalActualCost
  );

  const compliantServices = serviceAnalyses.filter((s) => s.discountCompliant);
  const nonCompliantServices = serviceAnalyses.filter(
    (s) => !s.discountCompliant
  );

  return (
    <div className="card card-shadow">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title h4 mb-0">Contract Discount Verification</h2>
          <div className="d-flex align-items-center">
            <label htmlFor="yearSelect" className="form-label me-2 mb-0">
              Contract Year:
            </label>
            <select
              id="yearSelect"
              className="form-select form-select-sm"
              value={selectedYearState}
              onChange={(e) => setSelectedYearState(Number(e.target.value))}
              style={{ width: "auto" }}
            >
              {contract.years.map((year) => (
                <option key={year.year} value={year.year}>
                  Year {year.year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h6 className="card-title">Contract Discount</h6>
                <h4>{yearData.discountRate}%</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h6 className="card-title">Actual Spend</h6>
                <h4>${totalActualCost.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className={`card ${
                isCommitmentMet ? "bg-success" : "bg-warning"
              } text-white`}
            >
              <div className="card-body text-center">
                <h6 className="card-title">Commitment</h6>
                <h4>${yearData.committedSpend.toLocaleString()}</h4>
                {!isCommitmentMet && (
                  <small>Short: ${commitmentShortfall.toLocaleString()}</small>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className={`card ${
                Math.abs(totalDiscrepancy) < 1 ? "bg-success" : "bg-danger"
              } text-white`}
            >
              <div className="card-body text-center">
                <h6 className="card-title">Discount Status</h6>
                <h4>
                  {Math.abs(totalDiscrepancy) < 1 ? "Compliant" : "Issues"}
                </h4>
                {Math.abs(totalDiscrepancy) >= 1 && (
                  <small>${totalDiscrepancy.toFixed(2)} discrepancy</small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="alert alert-success">
              <h6 className="alert-heading">
                <i className="bi bi-check-circle me-2"></i>
                Compliant Services ({compliantServices.length})
              </h6>
              <p className="mb-0">
                Expected Discount: ${totalExpectedDiscount.toFixed(2)}
                <br />
                Actual Discount: ${totalActualDiscount.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="col-md-6">
            {nonCompliantServices.length > 0 && (
              <div className="alert alert-danger">
                <h6 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Non-Compliant Services ({nonCompliantServices.length})
                </h6>
                <p className="mb-0">
                  Missing Discount: ${totalDiscrepancy.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Service Analysis */}
        <h5 className="mb-3">Service-by-Service Analysis</h5>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="table-light">
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th className="text-end">Actual Cost</th>
                <th className="text-end">Expected Discount</th>
                <th className="text-end">Actual Discount</th>
                <th className="text-end">Discrepancy</th>
                <th className="text-center">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {serviceAnalyses.map((analysis) => (
                <tr
                  key={analysis.service}
                  className={!analysis.discountCompliant ? "table-warning" : ""}
                >
                  <td>
                    <small>{analysis.service}</small>
                  </td>
                  <td>
                    {analysis.isExcluded ? (
                      <span className="badge bg-secondary">Excluded</span>
                    ) : analysis.isEligible ? (
                      <span className="badge bg-primary">Eligible</span>
                    ) : (
                      <span className="badge bg-warning">Unknown</span>
                    )}
                  </td>
                  <td className="text-end">
                    ${analysis.actualCost.toFixed(2)}
                  </td>
                  <td className="text-end">
                    ${analysis.expectedDiscount.toFixed(2)}
                  </td>
                  <td className="text-end">
                    ${analysis.discountApplied.toFixed(2)}
                  </td>
                  <td className="text-end">
                    <span
                      className={
                        analysis.discrepancy > 0.01
                          ? "text-danger"
                          : analysis.discrepancy < -0.01
                          ? "text-warning"
                          : "text-success"
                      }
                    >
                      ${analysis.discrepancy.toFixed(2)}
                    </span>
                  </td>
                  <td className="text-center">
                    {analysis.discountCompliant ? (
                      <i className="bi bi-check-circle text-success"></i>
                    ) : (
                      <i className="bi bi-exclamation-triangle text-danger"></i>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Items */}
        {nonCompliantServices.length > 0 && (
          <div className="mt-4">
            <h6 className="text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Action Required
            </h6>
            <ul className="list-unstyled">
              {nonCompliantServices.map((service) => (
                <li key={service.service} className="mb-1">
                  <small>
                    • <strong>{service.service}</strong>:
                    {service.discrepancy > 0.01
                      ? ` Missing $${service.discrepancy.toFixed(2)} discount`
                      : ` Unexpected $${Math.abs(service.discrepancy).toFixed(
                          2
                        )} discount applied`}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingAnalyzer;
