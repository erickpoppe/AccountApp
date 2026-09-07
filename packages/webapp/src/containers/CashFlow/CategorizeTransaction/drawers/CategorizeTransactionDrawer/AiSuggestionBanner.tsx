// @ts-nocheck
import React, { useState } from 'react';
import { Button, Callout, Intent, Tag, Tooltip } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import { useCategorizeTransactionBoot } from './CategorizeTransactionBoot';

const CONFIDENCE_INTENT: Record<string, Intent> = {
  high: Intent.SUCCESS,
  medium: Intent.PRIMARY,
  low: Intent.NONE,
};

export function AiSuggestionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { autofillCategorizeValues } = useCategorizeTransactionBoot();
  const { values, setFieldValue } = useFormikContext<any>();

  if (
    dismissed ||
    !autofillCategorizeValues?.isAiSuggested ||
    !autofillCategorizeValues?.aiSuggestedAccountId ||
    values.creditAccountId
  ) {
    return null;
  }

  const {
    aiSuggestedAccountId,
    aiSuggestedAccountName,
    aiSuggestedPayee,
    aiSuggestedMemo,
    aiConfidence,
    aiReasoning,
    aiSource,
  } = autofillCategorizeValues;

  const handleApply = () => {
    setFieldValue('creditAccountId', aiSuggestedAccountId);
    if (aiSuggestedPayee && !values.payee) {
      setFieldValue('payee', aiSuggestedPayee);
    }
    if (aiSuggestedMemo && !values.description) {
      setFieldValue('description', aiSuggestedMemo);
    }
  };

  const sourceLabel = aiSource === 'history' ? 'from history' : 'by local AI';
  const confidenceLabel = aiConfidence ?? 'low';

  return (
    <Callout
      intent={Intent.PRIMARY}
      icon="lightbulb"
      style={{ marginBottom: 12, padding: '8px 12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#4a5568' }}>
          Suggested account ({sourceLabel}):
        </span>

        <Tooltip content={aiReasoning || undefined} disabled={!aiReasoning}>
          <Tag intent={CONFIDENCE_INTENT[confidenceLabel] ?? Intent.NONE}>
            {aiSuggestedAccountName}
          </Tag>
        </Tooltip>

        <Button
          small
          intent={Intent.PRIMARY}
          onClick={handleApply}
          style={{ marginLeft: 'auto' }}
        >
          Apply
        </Button>

        <Button
          small
          minimal
          icon="cross"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss AI suggestion"
        />
      </div>
    </Callout>
  );
}
