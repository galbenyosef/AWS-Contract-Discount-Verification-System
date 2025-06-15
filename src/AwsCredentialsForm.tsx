import React, { useState } from "react";

export type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

type Props = {
  onSubmit: (creds: AwsCredentials) => void;
};

const AwsCredentialsForm: React.FC<Props> = ({ onSubmit }) => {
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("us-east-1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ accessKeyId, secretAccessKey, region });
  };

  return (
    <div className="card card-shadow">
      <div className="card-body p-4">
        <div className="mb-4">
          <h2 className="card-title h4 mb-2">AWS Credentials</h2>
          <p className="text-muted">
            Enter your AWS credentials to fetch billing data from Cost Explorer
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="accessKeyId" className="form-label fw-semibold">
              Access Key ID
            </label>
            <input
              type="text"
              className="form-control"
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="AKIA..."
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="secretAccessKey" className="form-label fw-semibold">
              Secret Access Key
            </label>
            <input
              type="password"
              className="form-control"
              id="secretAccessKey"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="Enter your secret access key"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="region" className="form-label fw-semibold">
              AWS Region
            </label>
            <select
              className="form-select"
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
          </div>

          <div className="alert alert-info d-flex align-items-start mb-4">
            <i className="bi bi-info-circle me-3 mt-1"></i>
            <div>
              <h6 className="alert-heading mb-1">Security Note</h6>
              <p className="mb-0 small">
                Your credentials are only used locally and are not stored or
                transmitted to any external servers.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gradient w-100 py-2 fw-semibold"
          >
            Connect to AWS
          </button>
        </form>
      </div>
    </div>
  );
};

export default AwsCredentialsForm;
