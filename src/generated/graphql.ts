import * as Types from './graphql-types.js';

export type AddIssueToProjectMutationVariables = Types.Exact<{
  issueId: Types.Scalars['ID']['input'];
  projectId: Types.Scalars['ID']['input'];
}>;


export type AddIssueToProjectMutation = { __typename?: 'Mutation', addProjectV2ItemById?: { __typename?: 'AddProjectV2ItemByIdPayload', item?: { __typename?: 'ProjectV2Item', id: string, fieldValues: { __typename?: 'ProjectV2ItemFieldValueConnection', nodes?: Array<
          | { __typename: 'ProjectV2ItemFieldDateValue' }
          | { __typename: 'ProjectV2ItemFieldIterationValue' }
          | { __typename: 'ProjectV2ItemFieldLabelValue' }
          | { __typename: 'ProjectV2ItemFieldMilestoneValue' }
          | { __typename: 'ProjectV2ItemFieldNumberValue', number?: number | null, field:
              | { __typename: 'ProjectV2Field', id: string, name: string }
              | { __typename: 'ProjectV2IterationField' }
              | { __typename: 'ProjectV2SingleSelectField' }
             }
          | { __typename: 'ProjectV2ItemFieldPullRequestValue' }
          | { __typename: 'ProjectV2ItemFieldRepositoryValue' }
          | { __typename: 'ProjectV2ItemFieldReviewerValue' }
          | { __typename: 'ProjectV2ItemFieldSingleSelectValue' }
          | { __typename: 'ProjectV2ItemFieldTextValue' }
          | { __typename: 'ProjectV2ItemFieldUserValue' }
         | null> | null } } | null } | null };

export type UpdateProjectFieldNumberValueMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID']['input'];
  itemId: Types.Scalars['ID']['input'];
  fieldId: Types.Scalars['ID']['input'];
  number?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type UpdateProjectFieldNumberValueMutation = { __typename?: 'Mutation', updateProjectV2ItemFieldValue?: { __typename?: 'UpdateProjectV2ItemFieldValuePayload', projectV2Item?: { __typename?: 'ProjectV2Item', id: string } | null } | null };
