import React, { useEffect, useState, useRef } from "react";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";
import { type AwsCredentials } from "./AwsCredentialsForm";

type Props = {
  credentials: AwsCredentials;
  startDate: string;
  endDate: string;
  onFetched: (data: BillingItem[]) => void;
  onError: (message: string) => void;
};

type BillingItem = {
  service: string;
  cost: number;
};

const BillingFetcher: React.FC<Props> = ({
  credentials,
  startDate,
  endDate,
  onFetched,
  onError,
}) => {
  const [data, setData] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // Reset state when credentials change
    setData([]);
    setHasError(false);
    fetchAttempted.current = false;
  }, [
    credentials.accessKeyId,
    credentials.secretAccessKey,
    credentials.region,
  ]);

  useEffect(() => {
    // Only fetch if we haven't attempted yet and there's no error
    if (fetchAttempted.current || hasError) {
      return;
    }

    const fetchCosts = async () => {
      fetchAttempted.current = true;
      setLoading(true);
      setData([]);

      try {
        const client = new CostExplorerClient({
          region: credentials.region,
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
          },
        });

        const command = new GetCostAndUsageCommand({
          TimePeriod: {
            Start: startDate,
            End: endDate,
          },
          Granularity: "MONTHLY",
          Metrics: ["UnblendedCost"],
          GroupBy: [
            {
              Type: "DIMENSION",
              Key: "SERVICE",
            },
          ],
        });

        const result = await client.send(command);

        if (!result.ResultsByTime?.[0]?.Groups) {
          setHasError(true);
          onError(
            "No billing data found for the selected period. This might happen if:\n• Your AWS account has no usage during this period\n• Cost Explorer needs more historical data\n• The account is new with insufficient billing history"
          );
          return;
        }

        const groups = result.ResultsByTime[0].Groups;
        const parsed: BillingItem[] = groups.map((g) => ({
          service: g.Keys?.[0] || "Unknown",
          cost: parseFloat(g.Metrics?.UnblendedCost?.Amount || "0"),
        }));

        // Filter out services with zero cost
        const filteredData = parsed.filter((item) => item.cost > 0);

        if (filteredData.length === 0) {
          setHasError(true);
          onError(
            "No billing data with costs found for the selected period. This might happen if:\n• Your AWS account has no billable usage during this period\n• All services used were within free tier limits\n• The account is new with insufficient billing history\n\nTip: Try using mock data for demonstration purposes."
          );
          return;
        }

        setData(filteredData);
        onFetched(filteredData);
      } catch (err: unknown) {
        console.error("Error fetching billing data:", err);
        setHasError(true);
        let errorMessage =
          "Error fetching billing data. Please check your credentials.";

        if (err instanceof Error) {
          if (err.message.includes("DataUnavailableException")) {
            errorMessage =
              "Cost Explorer data is not available for this date range. Please try:\n• Using a date range from at least 2-3 days ago\n• Enabling Cost Explorer in your AWS account\n• Waiting 24-48 hours after enabling Cost Explorer";
          } else if (err.message.includes("AccessDenied")) {
            errorMessage =
              "Access denied. Please ensure your AWS credentials have Cost Explorer permissions (ce:GetCostAndUsage).";
          } else if (
            err.message.includes("InvalidCredentials") ||
            err.message.includes("UnrecognizedClientException")
          ) {
            errorMessage =
              "Invalid AWS credentials. The security token or credentials are incorrect. Please check:\n• Your Access Key ID and Secret Access Key\n• That the credentials are active and not expired\n• The correct AWS region is selected";
          } else if (err.message.includes("SignatureDoesNotMatch")) {
            errorMessage =
              "AWS signature mismatch. Please verify your Secret Access Key is correct.";
          } else {
            errorMessage = err.message;
          }
        }

        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [credentials, startDate, endDate, hasError]);

  return (
    <div className="card card-shadow mb-4">
      <div className="card-body">
        <h2 className="card-title h5 mb-3">
          Billing Data ({startDate} - {endDate})
        </h2>
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-4">
            <div className="spinner-border text-primary me-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-muted">Fetching billing data...</span>
          </div>
        ) : data.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col" className="text-end">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.service}>
                    <td>{item.service}</td>
                    <td className="text-end">${item.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BillingFetcher;
