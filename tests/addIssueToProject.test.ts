import { describe, expect, it } from 'vitest'
import { parseAddIssueToProjectMutation } from '../src/addIssueToProject.js'

describe('parseAddIssueToProjectMutation', () => {
  it('parses the response', () => {
    expect(
      parseAddIssueToProjectMutation(
        {
          addProjectV2ItemById: {
            item: {
              id: 'PVTI_lADOAVRuvs4BSXonzgn-rZs',
              fieldValues: {
                nodes: [
                  {
                    __typename: 'ProjectV2ItemFieldRepositoryValue',
                  },
                  {
                    __typename: 'ProjectV2ItemFieldTextValue',
                  },
                  {
                    __typename: 'ProjectV2ItemFieldDateValue',
                  },
                  {
                    __typename: 'ProjectV2ItemFieldNumberValue',
                    field: {
                      __typename: 'ProjectV2Field',
                      id: 'PVTF_lADOAVRuvs4BSXonzg_7LJQ',
                      name: 'Calls',
                    },
                    number: 1,
                  },
                  {
                    __typename: 'ProjectV2ItemFieldNumberValue',
                    field: {
                      __typename: 'ProjectV2Field',
                      id: 'PVTF_lADOAVRuvs4BSXonzg_7LKA',
                      name: 'Cost USD',
                    },
                    number: 0.1664915,
                  },
                  {
                    __typename: 'ProjectV2ItemFieldSingleSelectValue',
                  },
                ],
              },
            },
          },
        },
        {
          issueId: 'MD_DUMMY',
          projectId: 'PVT_DUMMY',
          projectFieldIdCalls: 'PVTF_lADOAVRuvs4BSXonzg_7LJQ',
          projectFieldIdCostUsd: 'PVTF_lADOAVRuvs4BSXonzg_7LKA',
        },
      ),
    ).toStrictEqual({
      itemId: 'PVTI_lADOAVRuvs4BSXonzgn-rZs',
      calls: 1,
      costUsd: 0.1664915,
    })
  })
})
