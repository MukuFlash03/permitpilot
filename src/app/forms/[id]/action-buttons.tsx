'use client'

import { Button } from '@/components/button'

interface ActionButtonsProps {
  formName: string;
  generatePDF: boolean;
  submitOnline: boolean;
  autoFillForm: boolean;
}

export default function ActionButtons({ formName, generatePDF, submitOnline, autoFillForm }: ActionButtonsProps) {
  const handleAutoFillForm = () => {
    alert(`Autofilling form for ${formName}.`);
  };

  const handleGeneratePDF = () => {
    alert(`Generating PDF for ${formName}. This feature is not yet implemented.`);
  };

  const handleSubmitOnline = () => {
    console.log('Submitting online for', formName);
    // Implement online submission logic here
  };

  return (
    <div className="flex gap-4">
      {autoFillForm && (
        <Button outline onClick={handleAutoFillForm}>
          Autofill Form
        </Button>
      )}
      {generatePDF && (
        <Button outline onClick={handleGeneratePDF}>
          Generate PDF
        </Button>
      )}
      {submitOnline && (
        <Button onClick={handleSubmitOnline}>
          Submit Online
        </Button>
      )}
    </div>
  );
}