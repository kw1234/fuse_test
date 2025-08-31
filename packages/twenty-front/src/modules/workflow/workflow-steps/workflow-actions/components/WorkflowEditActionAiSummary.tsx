import { useAiSummaryOutputSchema } from '@/ai/hooks/useAiSummaryOutputSchema';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowAiSummaryAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { type BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type JsonValue } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';
import { WorkflowOutputSchemaBuilder } from '../ai-agent-action/components/WorkflowOutputSchemaBuilder';

type WorkflowEditActionAiSummaryProps = {
  action: WorkflowAiSummaryAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowAiSummaryAction) => void;
      };
};

type AiSummaryFormData = {
  prompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
};

const MODEL_OPTIONS: SelectOption<string>[] = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
  { label: 'GPT-4o', value: 'gpt-4o' },
];

export const WorkflowEditActionAiSummary = ({
  action,
  actionOptions,
}: WorkflowEditActionAiSummaryProps) => {
  const { getIcon } = useIcons();

  const [formData, setFormData] = useState<AiSummaryFormData>({
    prompt: action.settings.input.prompt ?? '',
    model: action.settings.input.model ?? 'gpt-3.5-turbo',
    maxTokens: action.settings.input.maxTokens ?? 500,
    temperature: action.settings.input.temperature ?? 0.7,
  });

  const saveAction = useDebouncedCallback(
    async (formData: AiSummaryFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            prompt: formData.prompt,
            model: formData.model,
            maxTokens: formData.maxTokens,
            temperature: formData.temperature,
          },
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleFieldChange = (
    fieldName: keyof AiSummaryFormData,
    updatedValue: JsonValue,
  ) => {
    const newFormData: AiSummaryFormData = {
      ...formData,
      [fieldName]: updatedValue,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'AI Summary',
    });

  const { handleOutputSchemaChange, outputFields } = useAiSummaryOutputSchema(
    action.settings.outputSchema as BaseOutputSchema,
    actionOptions.readonly === true ? undefined : actionOptions.onActionUpdate,
    action,
    actionOptions.readonly,
  );

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        <FormTextFieldInput
          label="Prompt"
          placeholder="Enter your prompt for AI summary generation"
          readonly={actionOptions.readonly}
          defaultValue={formData.prompt}
          onChange={(prompt) => {
            handleFieldChange('prompt', prompt);
          }}
          VariablePicker={WorkflowVariablePicker}
          multiline
        />
        <Select
          dropdownId="select-ai-model"
          label="AI Model"
          fullWidth
          value={formData.model}
          options={MODEL_OPTIONS}
          onChange={(model) => {
            if (isDefined(model)) {
              handleFieldChange('model', model);
            }
          }}
          disabled={actionOptions.readonly}
        />
        <FormTextFieldInput
          label="Max Tokens"
          placeholder="Maximum number of tokens (e.g., 500)"
          readonly={actionOptions.readonly}
          defaultValue={formData.maxTokens.toString()}
          onChange={(maxTokens) => {
            const value = parseInt(maxTokens as string, 10);
            if (!isNaN(value) && value > 0) {
              handleFieldChange('maxTokens', value);
            }
          }}
        />
        <FormTextFieldInput
          label="Temperature"
          placeholder="Creativity level (0.0 - 2.0, e.g., 0.7)"
          readonly={actionOptions.readonly}
          defaultValue={formData.temperature.toString()}
          onChange={(temperature) => {
            const value = parseFloat(temperature as string);
            if (!isNaN(value) && value >= 0 && value <= 2) {
              handleFieldChange('temperature', value);
            }
          }}
        />

        <WorkflowOutputSchemaBuilder
          fields={outputFields}
          onChange={handleOutputSchemaChange}
          readonly={actionOptions.readonly}
        />
      </WorkflowStepBody>
    </>
  );
};
