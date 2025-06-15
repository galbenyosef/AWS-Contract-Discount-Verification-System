import React from "react";

type Step = {
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
};

type StepWizardProps = {
  steps: Step[];
};

const StepWizard: React.FC<StepWizardProps> = ({ steps }) => {
  return (
    <div className="step-wizard">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step-item ${step.isCompleted ? "completed" : ""} ${
            step.isActive ? "active" : ""
          }`}
        >
          <div
            className={`step-circle ${
              step.isCompleted
                ? "completed"
                : step.isActive
                ? "active"
                : "inactive"
            }`}
          >
            {step.isCompleted ? (
              <i className="bi bi-check" style={{ fontSize: "16px" }}></i>
            ) : (
              index + 1
            )}
          </div>
          <div>
            <h6 className="mb-1 fw-semibold">{step.title}</h6>
            <small className="text-muted">{step.description}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepWizard;
